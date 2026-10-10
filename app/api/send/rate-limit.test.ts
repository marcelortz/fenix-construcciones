import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mocks de Upstash: no hay red en los tests.
const { limitMock, ratelimitConfigs, redisConfigs } = vi.hoisted(() => ({
  limitMock: vi.fn(),
  ratelimitConfigs: [] as unknown[],
  redisConfigs: [] as unknown[],
}));
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow(tokens: number, window: string) {
      return { tokens, window };
    }
    limit = limitMock;
    constructor(config: unknown) {
      ratelimitConfigs.push(config);
    }
  },
}));
vi.mock('@upstash/redis', () => ({
  Redis: class {
    constructor(config: unknown) {
      redisConfigs.push(config);
    }
  },
}));

const UPSTASH_VARS = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
];

// El limitador guarda estado a nivel de módulo y decide en la importación si
// usa Upstash: cada test importa una copia nueva con el entorno que necesita.
async function freshLimiter(env: Record<string, string> = {}) {
  for (const k of UPSTASH_VARS) delete process.env[k];
  Object.assign(process.env, env);
  vi.resetModules();
  return import('./rate-limit');
}

beforeEach(() => {
  limitMock.mockReset();
  ratelimitConfigs.length = 0;
  redisConfigs.length = 0;
});

afterEach(() => {
  for (const k of UPSTASH_VARS) delete process.env[k];
});

describe('rateLimited con Upstash', () => {
  const ENV = {
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'token',
  };

  it('configura una ventana deslizante de 5 envíos por minuto', async () => {
    await freshLimiter(ENV);

    expect(redisConfigs).toEqual([{ url: ENV.UPSTASH_REDIS_REST_URL, token: 'token' }]);
    expect(ratelimitConfigs[0]).toMatchObject({
      limiter: { tokens: 5, window: '60 s' },
      prefix: 'fenix:send',
      ephemeralCache: false,
    });
  });

  it('acepta los nombres de variable de la integración de Vercel', async () => {
    await freshLimiter({ KV_REST_API_URL: 'https://kv.upstash.io', KV_REST_API_TOKEN: 'kv' });

    expect(redisConfigs).toEqual([{ url: 'https://kv.upstash.io', token: 'kv' }]);
  });

  it('ignora variables de Upstash vacías y usa las de Vercel', async () => {
    // Así quedan si se copia .env.example tal cual y luego `vercel env pull`.
    await freshLimiter({
      UPSTASH_REDIS_REST_URL: '',
      UPSTASH_REDIS_REST_TOKEN: '',
      KV_REST_API_URL: 'https://kv.upstash.io',
      KV_REST_API_TOKEN: 'kv',
    });

    expect(redisConfigs).toEqual([{ url: 'https://kv.upstash.io', token: 'kv' }]);
  });

  it('bloquea cuando Upstash dice que se superó el límite', async () => {
    const { rateLimited } = await freshLimiter(ENV);
    limitMock.mockResolvedValueOnce({ success: true });
    limitMock.mockResolvedValueOnce({ success: false });

    expect(await rateLimited('1.1.1.1')).toBe(false);
    expect(await rateLimited('1.1.1.1')).toBe(true);
    expect(limitMock).toHaveBeenCalledWith('1.1.1.1');
  });

  it('usa el límite en memoria si Upstash no responde a tiempo', async () => {
    const { rateLimited, trackedKeys } = await freshLimiter(ENV);
    // Así responde la librería cuando vence su timeout: deja pasar sin contar.
    limitMock.mockResolvedValue({ success: true, reason: 'timeout' });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    for (let i = 0; i < 5; i++) expect(await rateLimited('1.1.1.1')).toBe(false);
    expect(await rateLimited('1.1.1.1')).toBe(true);
    expect(trackedKeys()).toBe(1);

    errorSpy.mockRestore();
  });

  it('usa el límite en memoria si Upstash falla', async () => {
    const { rateLimited, trackedKeys } = await freshLimiter(ENV);
    limitMock.mockRejectedValue(new Error('network down'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    for (let i = 0; i < 5; i++) expect(await rateLimited('1.1.1.1')).toBe(false);
    expect(await rateLimited('1.1.1.1')).toBe(true);
    expect(trackedKeys()).toBe(1);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

describe('rateLimited en memoria (sin Upstash)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no crea el cliente de Upstash', async () => {
    await freshLimiter();

    expect(ratelimitConfigs).toHaveLength(0);
  });

  it('permite 5 envíos por minuto y bloquea el sexto', async () => {
    const { rateLimited } = await freshLimiter();

    for (let i = 0; i < 5; i++) expect(await rateLimited('1.1.1.1')).toBe(false);
    expect(await rateLimited('1.1.1.1')).toBe(true);
    // Otra IP no se ve afectada.
    expect(await rateLimited('2.2.2.2')).toBe(false);
    expect(limitMock).not.toHaveBeenCalled();
  });

  it('vuelve a permitir envíos cuando pasa la ventana', async () => {
    const { rateLimited } = await freshLimiter();

    for (let i = 0; i < 6; i++) await rateLimited('1.1.1.1');
    vi.advanceTimersByTime(60_000);

    expect(await rateLimited('1.1.1.1')).toBe(false);
  });

  it('elimina del mapa los clientes inactivos', async () => {
    const { rateLimited, trackedKeys } = await freshLimiter();

    for (let i = 0; i < 100; i++) await rateLimited(`10.0.0.${i}`);
    expect(trackedKeys()).toBe(100);

    // Pasada la ventana, la siguiente petición dispara la limpieza:
    // solo queda la IP que acaba de llegar.
    vi.advanceTimersByTime(60_000);
    await rateLimited('9.9.9.9');

    expect(trackedKeys()).toBe(1);
  });

  it('guarda como mucho 6 instantes por cliente aunque inunde el endpoint', async () => {
    const { rateLimited, trackedHits } = await freshLimiter();

    for (let i = 0; i < 1000; i++) {
      expect(await rateLimited('6.6.6.6')).toBe(i >= 5);
      vi.advanceTimersByTime(10);
    }

    expect(trackedHits('6.6.6.6')).toBe(6);
  });

  it('decide igual que sin recortar la lista', async () => {
    const { rateLimited } = await freshLimiter();
    // Referencia: la misma ventana deslizante, guardando todos los instantes.
    const all: number[] = [];
    const reference = (now: number) => {
      const recent = all.filter((t) => now - t < 60_000);
      all.length = 0;
      all.push(...recent, now);
      return all.length > 5;
    };

    // Ráfagas, insistencia mientras está bloqueada y pausas largas.
    const gaps = [0, 0, 0, 0, 0, 0, 0, 1_000, 20_000, 20_000, 20_000, 59_999, 1, 0, 0, 0, 0, 0, 0,
      30_000, 31_000, 5_000, 5_000, 5_000, 5_000, 5_000, 5_000, 61_000, 0, 0];
    for (const gap of gaps) {
      vi.advanceTimersByTime(gap);
      expect(await rateLimited('7.7.7.7')).toBe(reference(Date.now()));
    }
  });

  it('conserva los clientes con peticiones dentro de la ventana', async () => {
    const { rateLimited, trackedKeys } = await freshLimiter();

    await rateLimited('1.1.1.1'); // t = 0 s, dispara la primera limpieza
    vi.advanceTimersByTime(30_000);
    await rateLimited('2.2.2.2'); // t = 30 s
    vi.advanceTimersByTime(30_000);
    await rateLimited('3.3.3.3'); // t = 60 s: limpieza; 1.1.1.1 caduca, 2.2.2.2 no

    expect(trackedKeys()).toBe(2);
    // 2.2.2.2 conserva su historial: 5 envíos más lo bloquean.
    for (let i = 0; i < 4; i++) expect(await rateLimited('2.2.2.2')).toBe(false);
    expect(await rateLimited('2.2.2.2')).toBe(true);
  });
});

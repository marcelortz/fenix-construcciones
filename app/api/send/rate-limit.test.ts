import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// El limitador guarda estado a nivel de módulo: cada test importa una copia
// nueva para empezar con el mapa vacío.
async function freshLimiter() {
  vi.resetModules();
  return import('./rate-limit');
}

describe('rateLimited', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permite 5 envíos por minuto y bloquea el sexto', async () => {
    const { rateLimited } = await freshLimiter();

    for (let i = 0; i < 5; i++) expect(rateLimited('1.1.1.1')).toBe(false);
    expect(rateLimited('1.1.1.1')).toBe(true);
    // Otra IP no se ve afectada.
    expect(rateLimited('2.2.2.2')).toBe(false);
  });

  it('vuelve a permitir envíos cuando pasa la ventana', async () => {
    const { rateLimited } = await freshLimiter();

    for (let i = 0; i < 6; i++) rateLimited('1.1.1.1');
    vi.advanceTimersByTime(60_000);

    expect(rateLimited('1.1.1.1')).toBe(false);
  });

  it('elimina del mapa las IPs inactivas', async () => {
    const { rateLimited, trackedIps } = await freshLimiter();

    for (let i = 0; i < 100; i++) rateLimited(`10.0.0.${i}`);
    expect(trackedIps()).toBe(100);

    // Pasada la ventana, la siguiente petición dispara la limpieza:
    // solo queda la IP que acaba de llegar.
    vi.advanceTimersByTime(60_000);
    rateLimited('9.9.9.9');

    expect(trackedIps()).toBe(1);
  });

  it('conserva las IPs con peticiones dentro de la ventana', async () => {
    const { rateLimited, trackedIps } = await freshLimiter();

    rateLimited('1.1.1.1'); // t = 0 s, dispara la primera limpieza
    vi.advanceTimersByTime(30_000);
    rateLimited('2.2.2.2'); // t = 30 s
    vi.advanceTimersByTime(30_000);
    rateLimited('3.3.3.3'); // t = 60 s: limpieza; 1.1.1.1 caduca, 2.2.2.2 no

    expect(trackedIps()).toBe(2);
    // 2.2.2.2 conserva su historial: 5 envíos más lo bloquean.
    for (let i = 0; i < 4; i++) expect(rateLimited('2.2.2.2')).toBe(false);
    expect(rateLimited('2.2.2.2')).toBe(true);
  });
});

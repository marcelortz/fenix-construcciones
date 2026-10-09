import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// --- Rate limiting por IP: 5 envíos por minuto, ventana deslizante ---
// Con Upstash Redis configurado, el contador es compartido entre todas las
// instancias de Vercel. Sin él (desarrollo local, tests) o si Redis falla,
// se usa un contador en memoria de la instancia.
const RATE_LIMIT = 5; // máximo de envíos
const RATE_WINDOW_MS = 60_000; // por minuto

function createUpstashLimiter(): Ratelimit | null {
  // Acepta los nombres de Upstash y los que crea la integración de Vercel.
  // `||` y no `??`: una variable vacía (como en .env.example) no debe tapar
  // a la otra.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT, `${RATE_WINDOW_MS / 1000} s`),
    prefix: 'fenix:send',
    // Sin caché local de IPs bloqueadas: solo se limpia cuando la IP vuelve,
    // y un formulario de contacto no necesita ahorrarse la llamada a Redis.
    ephemeralCache: false,
    // Si Redis tarda más de 1 s, se usa el límite en memoria (ver rateLimited).
    timeout: 1000,
  });
}

const upstash = createUpstashLimiter();

export async function rateLimited(ip: string): Promise<boolean> {
  if (upstash) {
    try {
      const { success, reason } = await upstash.limit(ip);
      // Si Redis no responde a tiempo, la librería deja pasar la petición sin
      // contarla: en ese caso aplicamos el límite en memoria.
      if (reason !== 'timeout') return !success;
      console.error('Upstash no respondió a tiempo, se usa el límite en memoria');
    } catch (err) {
      console.error('Upstash no disponible, se usa el límite en memoria:', err);
    }
  }
  return memoryRateLimited(ip);
}

// --- Respaldo en memoria ---
const hits = new Map<string, number[]>();

// Limpieza periódica: sin ella, las IPs que no vuelven se quedan en el mapa
// para siempre. Como mucho una vez por ventana, para no recorrerlo en cada
// petición.
let lastSweep = 0;

function sweep(now: number): void {
  for (const [ip, times] of hits) {
    // times está ordenado: si el último caducó, caducaron todos.
    if (now - times[times.length - 1] >= RATE_WINDOW_MS) hits.delete(ip);
  }
  lastSweep = now;
}

function memoryRateLimited(ip: string): boolean {
  const now = Date.now();
  if (now - lastSweep >= RATE_WINDOW_MS) sweep(now);

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// Solo para tests: número de IPs que el limitador en memoria mantiene.
export function trackedIps(): number {
  return hits.size;
}

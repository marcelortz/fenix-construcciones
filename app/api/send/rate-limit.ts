import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// --- Rate limiting por cliente: 5 envíos por minuto, ventana deslizante ---
// La clave del cliente la calcula rateLimitKey() (client-ip.ts): la IPv4 tal
// cual o el prefijo /64 de una IPv6. Aquí se trata como un texto opaco.
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
    // Sin caché local de clientes bloqueados: solo se limpia cuando el
    // cliente vuelve, y un formulario de contacto no necesita ahorrarse la
    // llamada a Redis.
    ephemeralCache: false,
    // Si Redis tarda más de 1 s, se usa el límite en memoria (ver rateLimited).
    timeout: 1000,
  });
}

const upstash = createUpstashLimiter();

export async function rateLimited(key: string): Promise<boolean> {
  if (upstash) {
    try {
      const { success, reason } = await upstash.limit(key);
      // Si Redis no responde a tiempo, la librería deja pasar la petición sin
      // contarla: en ese caso aplicamos el límite en memoria.
      if (reason !== 'timeout') return !success;
      console.error('Upstash no respondió a tiempo, se usa el límite en memoria');
    } catch (err) {
      console.error('Upstash no disponible, se usa el límite en memoria:', err);
    }
  }
  return memoryRateLimited(key);
}

// --- Respaldo en memoria ---
const hits = new Map<string, number[]>();

// Limpieza periódica: sin ella, los clientes que no vuelven se quedan en el mapa
// para siempre. Como mucho una vez por ventana, para no recorrerlo en cada
// petición.
let lastSweep = 0;

function sweep(now: number): void {
  for (const [key, times] of hits) {
    // times está ordenado: si el último caducó, caducaron todos.
    if (now - times[times.length - 1] >= RATE_WINDOW_MS) hits.delete(key);
  }
  lastSweep = now;
}

function memoryRateLimited(key: string): boolean {
  const now = Date.now();
  if (now - lastSweep >= RATE_WINDOW_MS) sweep(now);

  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  const blocked = recent.length > RATE_LIMIT;
  // Para decidir basta con las RATE_LIMIT + 1 peticiones más recientes: si
  // alguna más antigua sigue en la ventana, las recientes también. Recortar
  // evita que un cliente que inunda el endpoint acumule miles de entradas.
  if (recent.length > RATE_LIMIT + 1) recent.splice(0, recent.length - (RATE_LIMIT + 1));
  hits.set(key, recent);
  return blocked;
}

// Solo para tests: número de clientes que el limitador en memoria mantiene.
export function trackedKeys(): number {
  return hits.size;
}

// Solo para tests: instantes guardados para un cliente.
export function trackedHits(key: string): number {
  return hits.get(key)?.length ?? 0;
}

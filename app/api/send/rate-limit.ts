// --- Rate limiting en memoria (por IP) ---
// Suficiente para una sola instancia; en serverless/escalado horizontal
// convendría un store compartido (Redis/Upstash). Ventana deslizante simple.
const RATE_LIMIT = 5; // máximo de envíos
const RATE_WINDOW_MS = 60_000; // por minuto
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

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (now - lastSweep >= RATE_WINDOW_MS) sweep(now);

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// Solo para tests: número de IPs que el limitador mantiene en memoria.
export function trackedIps(): number {
  return hits.size;
}

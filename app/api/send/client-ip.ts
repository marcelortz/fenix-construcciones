import { isIPv4, isIPv6 } from 'node:net';

// IP del visitante. En Vercel, x-forwarded-for la fija la plataforma (sobrescribe
// la que mande el cliente), así que no se puede falsificar; fuera de Vercel haría
// falta un proxy que la limpie.
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() || 'desconocido';
}

// Clave para el rate limiting. Una conexión IPv6 suele disponer de un /64 entero,
// así que contar por dirección permitiría saltarse el límite rotando direcciones:
// las IPv6 se agrupan por su prefijo /64. Las IPv4 (también las IPv4 mapeadas en
// IPv6, ::ffff:a.b.c.d) se usan tal cual. Lo que no es una IP se devuelve igual.
export function rateLimitKey(ip: string): string {
  const addr = ip.split('%')[0].toLowerCase(); // quita el identificador de zona (fe80::1%eth0)
  if (isIPv4(addr)) return addr;
  if (!isIPv6(addr)) return ip;

  const groups = expandIPv6(addr);
  const mapped = groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff;
  if (mapped) {
    return [groups[6] >> 8, groups[6] & 0xff, groups[7] >> 8, groups[7] & 0xff].join('.');
  }
  return `${groups.slice(0, 4).map((g) => g.toString(16)).join(':')}::/64`;
}

// Convierte una IPv6 válida (comprimida o no, con IPv4 incrustada o no) en sus
// 8 grupos de 16 bits.
function expandIPv6(addr: string): number[] {
  const toGroups = (part: string): number[] => {
    if (!part) return [];
    return part.split(':').flatMap((g) => {
      if (!g.includes('.')) return [parseInt(g, 16)];
      const [a, b, c, d] = g.split('.').map(Number);
      return [(a << 8) | b, (c << 8) | d];
    });
  };

  const [head, tail] = addr.split('::');
  const left = toGroups(head);
  if (tail === undefined) return left;
  const right = toGroups(tail);
  return [...left, ...Array(8 - left.length - right.length).fill(0), ...right];
}

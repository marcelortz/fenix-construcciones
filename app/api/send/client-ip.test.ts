import { describe, it, expect } from 'vitest';
import { clientIp, rateLimitKey } from './client-ip';

const h = (init: Record<string, string>) => new Headers(init);

describe('clientIp', () => {
  it('usa x-forwarded-for', () => {
    expect(clientIp(h({ 'x-forwarded-for': '203.0.113.9' }))).toBe('203.0.113.9');
  });

  it('toma la primera IP de una cadena de proxies', () => {
    expect(clientIp(h({ 'x-forwarded-for': ' 203.0.113.9 , 10.0.0.1, 10.0.0.2' }))).toBe('203.0.113.9');
  });

  it('prefiere x-forwarded-for a x-real-ip', () => {
    expect(clientIp(h({ 'x-forwarded-for': '203.0.113.9', 'x-real-ip': '198.51.100.7' }))).toBe('203.0.113.9');
  });

  it('usa x-real-ip si no hay x-forwarded-for', () => {
    expect(clientIp(h({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
  });

  it('usa x-real-ip si x-forwarded-for viene vacía', () => {
    expect(clientIp(h({ 'x-forwarded-for': '', 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
  });

  it("devuelve 'desconocido' sin cabeceras de IP", () => {
    expect(clientIp(h({}))).toBe('desconocido');
    expect(clientIp(h({ 'x-real-ip': '  ' }))).toBe('desconocido');
  });
});

describe('rateLimitKey', () => {
  it('deja las IPv4 tal cual', () => {
    expect(rateLimitKey('203.0.113.9')).toBe('203.0.113.9');
  });

  it('agrupa las IPv6 por su prefijo /64', () => {
    expect(rateLimitKey('2001:db8:1:2:3:4:5:6')).toBe('2001:db8:1:2::/64');
  });

  it('da la misma clave a direcciones del mismo /64', () => {
    const a = rateLimitKey('2001:db8:1:2::1');
    const b = rateLimitKey('2001:db8:1:2:ffff:ffff:ffff:ffff');
    const c = rateLimitKey('2001:0DB8:0001:0002:0000:0000:0000:00AB'); // sin comprimir, mayúsculas
    expect(a).toBe('2001:db8:1:2::/64');
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it('da claves distintas a /64 distintos', () => {
    expect(rateLimitKey('2001:db8:1:2::1')).not.toBe(rateLimitKey('2001:db8:1:3::1'));
  });

  it('resuelve la compresión :: en cualquier posición', () => {
    expect(rateLimitKey('::1')).toBe('0:0:0:0::/64');
    expect(rateLimitKey('2001:db8::')).toBe('2001:db8:0:0::/64');
    expect(rateLimitKey('fe80::1%eth0')).toBe('fe80:0:0:0::/64');
  });

  it('trata las IPv4 mapeadas en IPv6 como IPv4', () => {
    expect(rateLimitKey('::ffff:203.0.113.9')).toBe('203.0.113.9');
    expect(rateLimitKey('::ffff:cb00:7109')).toBe('203.0.113.9');
  });

  it('devuelve sin cambios lo que no es una IP', () => {
    expect(rateLimitKey('desconocido')).toBe('desconocido');
    expect(rateLimitKey('2001:db8::g')).toBe('2001:db8::g');
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock de Resend ANTES de importar el route handler (vi.mock se hoistea).
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
    constructor(_apiKey: string) {}
  },
}));

import { POST } from './route';

const VALID_PAYLOAD = {
  nombre: 'Dr. Andrés Morales',
  telefono: '0991234567',
  email: 'andres@example.com',
  predio: 'Predio N° 481920',
  etapa: 'Terreno propio con escrituras e IRM al día',
  presupuesto: '$15,000 – $35,000 USD (Adecuaciones comerciales / Remodelación)',
  detalles: 'Metraje aprox 120m2',
};

// IP única por test para no interfere con el rate-limit en memoria.
let ipCounter = 0;
function makeReq(body: unknown, ip = `10.0.${ipCounter++}.1`) {
  return new NextRequest('http://localhost/api/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

function setEnv(overrides: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

describe('POST /api/send', () => {
  beforeEach(() => {
    sendMock.mockReset();
    // API key presente por defecto para los casos felices.
    setEnv({ RESEND_API_KEY: 're_test_key', LEAD_TO_EMAIL: undefined, RESEND_FROM: undefined });
  });

  describe('casos correctos', () => {
    it('acepta un payload válido y devuelve 200', async () => {
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

      const res = await POST(makeReq(VALID_PAYLOAD));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it('envía al destinatario por defecto cuando LEAD_TO_EMAIL no está seteado', async () => {
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

      await POST(makeReq(VALID_PAYLOAD));
      const call = sendMock.mock.calls[0][0];

      expect(call.to).toEqual(['omsortiz@gmail.com']);
    });

    it('usa LEAD_TO_EMAIL (varias direcciones separadas por coma)', async () => {
      setEnv({ LEAD_TO_EMAIL: 'a@x.com, b@y.com' });
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

      await POST(makeReq(VALID_PAYLOAD));
      const call = sendMock.mock.calls[0][0];

      expect(call.to).toEqual(['a@x.com', 'b@y.com']);
    });

    it('usa RESEND_FROM cuando está configurado', async () => {
      setEnv({ RESEND_FROM: 'Ventas <ventas@corp.com>' });
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });

      await POST(makeReq(VALID_PAYLOAD));
      const call = sendMock.mock.calls[0][0];

      expect(call.from).toBe('Ventas <ventas@corp.com>');
    });

    it('hace escape HTML del contenido del usuario (anti-XSS en el correo)', async () => {
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });
      const malicious = { ...VALID_PAYLOAD, nombre: '<script>alert(1)</script>' };

      await POST(makeReq(malicious));
      const call = sendMock.mock.calls[0][0];
      const html: string = call.html;

      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('&lt;script&gt;');
      // El asunto también debe estar escapado.
      expect(call.subject).toContain('&lt;script&gt;');
    });

    it('acepta detalles vacíos (campo opcional)', async () => {
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });
      const { detalles: _omit, ...noDetails } = VALID_PAYLOAD;

      const res = await POST(makeReq(noDetails));
      expect(res.status).toBe(200);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('casos de error - validación (Zod)', () => {
    it('rechaza email con formato inválido con 400', async () => {
      const res = await POST(makeReq({ ...VALID_PAYLOAD, email: 'no-es-email' }));
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe('Datos inválidos');
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('rechaza campo obligatorio faltante (predio) con 400', async () => {
      const { predio: _omit, ...sinPredio } = VALID_PAYLOAD;

      const res = await POST(makeReq(sinPredio));
      expect(res.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('rechaza etapa fuera del enum con 400', async () => {
      const res = await POST(makeReq({ ...VALID_PAYLOAD, etapa: 'opción inventada' }));

      expect(res.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('rechaza presupuesto fuera del enum con 400', async () => {
      const res = await POST(makeReq({ ...VALID_PAYLOAD, presupuesto: 'barato' }));

      expect(res.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('rechaza nombre demasiado largo (max 200) con 400', async () => {
      const res = await POST(makeReq({ ...VALID_PAYLOAD, nombre: 'x'.repeat(201) }));

      expect(res.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('rechaza un JSON que no es un objeto con 400', async () => {
      const res = await POST(makeReq('no es un objeto'));

      expect(res.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe('casos de error - infraestructura', () => {
    it('devuelve 503 si falta RESEND_API_KEY', async () => {
      setEnv({ RESEND_API_KEY: undefined });

      const res = await POST(makeReq(VALID_PAYLOAD));

      expect(res.status).toBe(503);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('devuelve 502 si Resend responde con error', async () => {
      sendMock.mockResolvedValue({ data: null, error: { message: 'rejected' } });

      const res = await POST(makeReq(VALID_PAYLOAD));

      expect(res.status).toBe(502);
    });

    it('devuelve 500 si Resend lanza una excepción', async () => {
      sendMock.mockRejectedValue(new Error('network down'));

      const res = await POST(makeReq(VALID_PAYLOAD));

      expect(res.status).toBe(500);
    });
  });

  describe('rate limiting', () => {
    it('bloquea con 429 después de 5 envíos en 1 minuto (misma IP)', async () => {
      sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });
      const ip = '203.0.113.9'; // IP fija para el rate-limit

      for (let i = 0; i < 5; i++) {
        const ok = await POST(makeReq(VALID_PAYLOAD, ip));
        expect(ok.status).toBe(200);
      }
      const blocked = await POST(makeReq(VALID_PAYLOAD, ip));
      const json = await blocked.json();

      expect(blocked.status).toBe(429);
      expect(json.error).toMatch(/Demasiados intentos/i);
    });
  });
});

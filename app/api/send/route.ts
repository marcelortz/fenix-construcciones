import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

const ETAPAS = [
  'Terreno propio con escrituras e IRM al día',
  'Local comercial con contrato de arriendo vigente',
  'Proyecto con planos estructurales listos para aprobación',
  'Requiere diseño arquitectónico y trámites desde cero',
] as const;

const PRESUPUESTOS = [
  '$15,000 – $35,000 USD (Adecuaciones comerciales / Remodelación)',
  '$35,000 – $80,000 USD (Estructuras / Clínicas fase 1)',
  'Más de $80,000 USD (Edificación completa / Fondos disponibles)',
  'Recopilando costos referenciales (sin presupuesto definido)',
] as const;

// Validación estricta del payload (defensa en profundidad: el front ya valida,
// pero el endpoint no debe confiar en el cliente).
const leadSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre requerido').max(200),
  telefono: z.string().trim().min(1, 'Teléfono requerido').max(40),
  email: z.string().trim().email('Correo inválido').max(200),
  predio: z.string().trim().min(1, 'Predio/RUC requerido').max(60),
  etapa: z.enum(ETAPAS),
  presupuesto: z.enum(PRESUPUESTOS),
  detalles: z.string().trim().max(2000).optional().default(''),
});

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Rate limiting en memoria (por IP) ---
// Suficiente para una sola instancia; en serverless/escalado horizontal
// convendría un store compartido (Redis/Upstash). Ventana deslizante simple.
const RATE_LIMIT = 5; // máximo de envíos
const RATE_WINDOW_MS = 60_000; // por minuto
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'desconocido';
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Intente nuevamente en un minuto.' },
      { status: 429 },
    );
  }

  let payload: z.infer<typeof leadSchema>;
  try {
    const body = await req.json();
    payload = leadSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { nombre, telefono, email, predio, etapa, presupuesto, detalles } = payload;

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.LEAD_TO_EMAIL ?? 'omsortiz@gmail.com').split(',').map((s) => s.trim());
  const from = process.env.RESEND_FROM ?? 'Fenix Web <onboarding@resend.dev>';

  if (!apiKey) {
    console.error('RESEND_API_KEY no configurada');
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from,
      to,
      subject: `Nueva Solicitud Calificada: ${escapeHtml(nombre)}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 5px;">Fénix Construcciones - Solicitud Filtrada</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 0;">Ficha de contacto validada desde el portal web.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />

          <h3 style="color: #0f172a; font-size: 15px;">Datos del Contacto:</h3>
          <p><strong>Nombre / Razón Social:</strong> ${escapeHtml(nombre)}</p>
          <p><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
          <p><strong>Correo electrónico:</strong> ${escapeHtml(email)}</p>

          <h3 style="color: #0f172a; font-size: 15px; margin-top: 20px;">Filtro de Viabilidad Técnica y Legal:</h3>
          <p><strong>1. Nº Predio Municipal / RUC:</strong> ${escapeHtml(predio)}</p>
          <p><strong>2. Estado documental:</strong> ${escapeHtml(etapa)}</p>
          <p><strong>3. Rango de Presupuesto:</strong> ${escapeHtml(presupuesto)}</p>
          <p><strong>4. Detalle o requerimiento:</strong> ${escapeHtml(detalles || 'No especificado')}</p>
        </div>
      `,
    });

    if (data.error) {
      console.error('Resend error:', data.error);
      return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 502 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error al procesar la solicitud de envío:', error);
    return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, telefono, email, predio, etapa, presupuesto, detalles } = body;

    const data = await resend.emails.send({
      from: 'Fenix Web <onboarding@resend.dev>',
      to: ['omsortiz@gmail.com'],
      subject: `Nueva Solicitud Calificada: ${escapeHtml(nombre)}`,
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

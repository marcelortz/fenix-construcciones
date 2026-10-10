// Contrato del formulario de contacto, compartido por la página (app/page.tsx)
// y la API (app/api/send/route.ts). Las opciones viven solo aquí: si cambian,
// cambian a la vez en el <select> y en la validación del servidor.

export const ETAPAS = [
  'Terreno propio con escrituras e IRM al día',
  'Local comercial con contrato de arriendo vigente',
  'Proyecto con planos estructurales listos para aprobación',
  'Requiere diseño arquitectónico y trámites desde cero',
] as const;

export const PRESUPUESTOS = [
  '$15,000 – $35,000 USD (Adecuaciones comerciales / Remodelación)',
  '$35,000 – $80,000 USD (Estructuras / Clínicas fase 1)',
  'Más de $80,000 USD (Edificación completa / Fondos disponibles)',
  'Recopilando costos referenciales (sin presupuesto definido)',
] as const;

// Comprobación rápida en el navegador para avisar en el paso 1. El servidor
// valida de nuevo con zod, que es la fuente de verdad.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

// Mensaje para el usuario según el código de respuesta de /api/send.
export function submitErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Algunos datos no son válidos. Revise el formulario e inténtelo de nuevo.';
    case 429:
      return 'Ha enviado demasiadas solicitudes seguidas. Espere un minuto e inténtelo de nuevo.';
    case 502:
    case 503:
      return 'El servicio de envío no está disponible en este momento. Inténtelo de nuevo en unos minutos.';
    default:
      return 'Hubo un inconveniente al enviar la solicitud. Inténtelo nuevamente.';
  }
}

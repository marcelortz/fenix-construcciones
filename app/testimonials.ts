export type Testimonial = {
  name: string;
  role: string;
  text: string;
  stars: number;
  // true mientras sea un texto de relleno pendiente de reemplazar.
  placeholder?: boolean;
};

// PENDIENTE: reemplazar por testimonios REALES de clientes, con su
// autorización por escrito, y quitar `placeholder: true`. Mientras quede
// alguno marcado, la sección de testimonios no se muestra en la web.
export const TESTIMONIALS: Testimonial[] = [
  {
    name: '[Nombre del cliente 1]',
    role: '[Cargo o empresa]',
    text: '[Testimonio real del cliente 1, con su autorización]',
    stars: 5,
    placeholder: true,
  },
  {
    name: '[Nombre del cliente 2]',
    role: '[Cargo o empresa]',
    text: '[Testimonio real del cliente 2, con su autorización]',
    stars: 5,
    placeholder: true,
  },
  {
    name: '[Nombre del cliente 3]',
    role: '[Cargo o empresa]',
    text: '[Testimonio real del cliente 3, con su autorización]',
    stars: 5,
    placeholder: true,
  },
];

export const SHOW_TESTIMONIALS = TESTIMONIALS.length > 0 && TESTIMONIALS.every((t) => !t.placeholder);

'use client';

import { useEffect, useState } from 'react';
import type { Testimonial } from '../testimonials';

// Carrusel de testimonios: avanza solo cada 5 s y permite saltar con los puntos.
export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section id="testimonios" className="px-6 py-16 bg-slate-900 border-t border-slate-800 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-12">Confianza de Nuestros Clientes</h2>

        <div className="relative h-64">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                i === currentTestimonial
                  ? 'opacity-100 translate-x-0 scale-100 z-10'
                  : 'opacity-0 translate-x-full scale-95 z-0'
              }`}
            >
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-xl">
                <div className="flex justify-center mb-4">
                  {[...Array(t.stars)].map((_, s) => (
                    <span key={s} className="text-amber-500 text-xl">★</span>
                  ))}
                </div>
                <p className="text-lg text-slate-300 italic mb-6">&quot;{t.text}&quot;</p>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-amber-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTestimonial(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentTestimonial ? 'w-8 bg-amber-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { siteUrl } from './site-config';

const INITIAL_FORM_DATA = {
  nombre: '',
  telefono: '',
  email: '',
  predio: '',
  etapa: 'Terreno propio con escrituras e IRM al día',
  presupuesto: '$35,000 – $80,000 USD (Estructuras / Clínicas fase 1)',
  detalles: '',
};

const TESTIMONIALS = [
  {
    name: 'Dr. Ricardo Mendoza',
    role: 'Director Clínico',
    text: 'La precisión técnica de Fénix en la adecuación de nuestros consultorios fue excepcional. Cumplieron estrictamente con la normativa ACESS, facilitando nuestra certificación.',
    stars: 5
  },
  {
    name: 'Arq. Sofia Valenzuela',
    role: 'Desarrolladora Inmobiliaria',
    text: 'Un equipo serio y comprometido. La gestión de permisos y la ejecución de la obra civil en Carapungo superaron nuestras expectativas en tiempos y calidad.',
    stars: 5
  },
  {
    name: 'Ing. Marco Tulio',
    role: 'Gestor de Proyectos',
    text: 'La validación técnica previa que realizan es un valor agregado enorme. Evitó que invirtiéramos en un predio con problemas catastrales.',
    stars: 5
  },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.nombre.trim() || !formData.telefono.trim())) {
      alert('Por favor complete todos sus datos de contacto.');
      return;
    }
    if (step === 2 && !formData.predio.trim()) {
      alert('Por favor ingrese el número de predio o RUC para verificación técnica.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEnviado(true);
      } else {
        alert('Hubo un inconveniente al enviar la solicitud. Inténtelo nuevamente.');
      }
    } catch {
      alert('Error de conexión al enviar el formulario.');
    } finally {
      setEnviando(false);
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setEnviado(false);
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navegación */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-amber-500 tracking-wider">FÉNIX</span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Construcciones</span>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#servicios" className="hover:text-amber-400 transition">Servicios</a>
          <a href="#proyectos" className="hover:text-amber-400 transition">Proyectos</a>
          <a href="#seguridad" className="hover:text-amber-400 transition">Control Técnico</a>
          <a href="#contacto" className="hover:text-amber-400 transition">Contacto</a>
        </div>
        <button 
          onClick={() => setModalOpen(true)} 
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition"
        >
          Solicitar Cotización
        </button>
      </nav>

      {/* Hero */}
      <header className="px-6 py-20 max-w-7xl mx-auto text-center md:text-left md:flex items-center justify-between gap-12">
        <div className="md:w-1/2 space-y-6">
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Sede Carapungo • Quito, Ecuador
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Construcción de alta precisión en <span className="text-amber-500">Carapungo</span>.
          </h1>
          <p className="text-slate-400 text-lg">
            Especialistas en edificación de infraestructura médica, locales comerciales y obras civiles bajo la Norma Ecuatoriana de la Construcción (NEC).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-3 rounded-lg font-bold text-center transition shadow-lg shadow-amber-500/20"
            >
              Iniciar Validación Técnica
            </button>
            <a href="#proyectos" className="border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-lg font-medium text-center transition">
              Ver Obras en Ejecución
            </a>
          </div>
        </div>

        <div className="mt-12 md:mt-0 md:w-5/12 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="text-xs text-amber-400 uppercase font-mono tracking-widest mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Estado de Obra Actual
            </div>
            <h3 className="text-xl font-bold mb-4">Centros Médicos & Farmacia</h3>
            <p className="text-sm text-slate-400 mb-6">Proyecto integral en desarrollo en el sector de Carapungo bajo normativa sanitaria y municipal de Quito.</p>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Ubicación:</span>
                <span className="text-slate-200">Carapungo, Quito</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Dirección de Obra:</span>
                <span className="text-slate-200 font-semibold">Administración General</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estado:</span>
                <span className="text-emerald-400 font-bold">En Ejecución Activa</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Servicios */}
      <section id="servicios" className="px-6 py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Nuestros Servicios</h2>
            <p className="text-slate-400 text-sm mt-2">Soluciones integrales de ingeniería y construcción civil bajo los más estrictos estándares de calidad y normativa NEC.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Infraestructura Médica',
                desc: 'Diseño y construcción de consultorios, clínicas y farmacias siguiendo la normativa ACESS y municipal.',
                icon: '🏥'
              },
              {
                title: 'Locales Comerciales',
                desc: 'Adecuación de espacios para retail y servicios, optimizando flujos de clientes y seguridad estructural.',
                icon: '🏪'
              },
              {
                title: 'Obras Civiles',
                desc: 'Construcción de edificaciones residenciales y comerciales con alta precisión técnica y control de calidad.',
                icon: '🏗️'
              },
              {
                title: 'Remodelación Técnica',
                desc: 'Actualización de infraestructuras existentes para cumplir con normativas vigentes y nuevas necesidades funcionales.',
                icon: '🛠️'
              },
              {
                title: 'Validación de Predios',
                desc: 'Análisis técnico de viabilidad en catastro municipal para asegurar la legalidad y factibilidad del proyecto.',
                icon: '📋'
              },
              {
                title: 'Gestión de Permisos',
                desc: 'Asesoría y trámite de licencias de construcción y permisos sanitarios ante las entidades reguladoras.',
                icon: '📜'
              },
            ].map((service, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-6 rounded-xl hover:border-amber-500/50 transition group flex flex-col">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-amber-400 transition">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{service.desc}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-bold rounded-lg transition-colors duration-200 border border-slate-700 hover:border-amber-500"
                  >
                    Solicitar este servicio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="px-6 py-16 bg-slate-900 border-t border-slate-800 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-12">Confianza de Nuestros Clientes</h2>

          <div className="relative h-64">
            {TESTIMONIALS.map((t, i) => (
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
                  <p className="text-lg text-slate-300 italic mb-6">"{t.text}"</p>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs text-amber-500 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
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

      {/* Proyectos */}
      <section id="proyectos" className="px-6 py-16 bg-slate-950/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Obras Destacadas</h2>
            <p className="text-slate-400 text-sm mt-2">Proyectos activos en Carapungo y el Distrito Metropolitano de Quito.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="relative h-56 w-full rounded-lg mb-6 overflow-hidden border border-slate-700/50 bg-slate-800">
                <Image
                  src="/centro-medico.jpg"
                  alt="Avance de obra centros médicos Carapungo"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <span className="text-xs font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded">Infraestructura Médica</span>
              <h3 className="text-xl font-bold mt-3 mb-2">Edificio de Centros Médicos</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Diseño y edificación de consultorios cumpliendo regulaciones sanitarias de la ACESS y normas estructurales de Quito.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="relative h-56 w-full rounded-lg mb-6 overflow-hidden border border-slate-700/50 bg-slate-800">
                <Image
                  src="/farmacia.jpg"
                  alt="Avance de obra farmacia Carapungo"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded">Local Comercial</span>
              <h3 className="text-xl font-bold mt-3 mb-2">Módulo Comercial & Farmacia</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Espacio comercial adaptado para almacenamiento farmacéutico, flujo continuo de clientes y seguridad reforzada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Contacto Institucional */}
      <section id="contacto" className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Protocolo de Atención Técnica</h2>
        <p className="text-slate-400 text-sm mb-8">
          Para garantizar la seguridad de la información y la seriedad de cada proyecto, las solicitudes son analizadas técnicamente antes del agendamiento de reuniones presenciales.
        </p>
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 space-y-4">
          <p className="text-lg font-semibold text-slate-200">Fénix Construcciones — Sede Carapungo</p>
          <div className="pt-4">
            <button 
              onClick={() => setModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-lg transition"
            >
              Completar Ficha de Validación
            </button>
          </div>
        </div>
      </section>

      {/* Modal con Filtro de Seguridad */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

            {enviado ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">✓</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Solicitud Recibida con Éxito</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">
                    La información ha sido enviada al departamento de ingeniería para su validación técnica.
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-left max-w-sm mx-auto">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2 text-center">Próximos Pasos</p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">1.</span>
                      <span>Verificación del predio en el catastro de Quito.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">2.</span>
                      <span>Análisis de viabilidad legal y técnica.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">3.</span>
                      <span>Contacto telefónico en un plazo de 24-48h laborables.</span>
                    </li>
                  </ul>
                </div>
                <button onClick={resetForm} className="mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-xl transition shadow-lg">
                  Volver al inicio
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <span className="text-xs text-amber-500 font-mono uppercase font-bold tracking-wider">
                    Filtro de Seguridad • Paso {step} de 3
                  </span>
                  <h3 className="text-lg font-bold mt-1 text-white">Calificación Técnica del Inmueble</h3>
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre completo o Razón Social *</label>
                      <input 
                        type="text" 
                        name="nombre" 
                        required
                        value={formData.nombre} 
                        onChange={handleChange}
                        placeholder="Ej. Dr. Andrés Morales" 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono de contacto *</label>
                      <input 
                        type="tel" 
                        name="telefono" 
                        required
                        value={formData.telefono} 
                        onChange={handleChange}
                        placeholder="Ej. 0991234567" 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Correo electrónico *</label>
                      <input 
                        type="email" 
                        name="email" 
                        required
                        value={formData.email} 
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com" 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition mt-2"
                    >
                      Siguiente: Datos del Predio →
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        1. Número de Predio Municipal (Quito) o RUC Comercial *
                      </label>
                      <input 
                        type="text" 
                        name="predio" 
                        required
                        value={formData.predio} 
                        onChange={handleChange}
                        placeholder="Ej. Predio N° 481920 o RUC de empresa" 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Requerido para comprobar viabilidad en la base municipal antes del contacto.</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        2. ¿En qué etapa legal y técnica se encuentra el proyecto?
                      </label>
                      <select 
                        name="etapa" 
                        value={formData.etapa} 
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option>Terreno propio con escrituras e IRM al día</option>
                        <option>Local comercial con contrato de arriendo vigente</option>
                        <option>Proyecto con planos estructurales listos para aprobación</option>
                        <option>Requiere diseño arquitectónico y trámites desde cero</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition"
                      >
                        ← Atrás
                      </button>
                      <button 
                        type="button"
                        onClick={handleNext}
                        className="w-2/3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition"
                      >
                        Siguiente: Presupuesto →
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        3. Rango de presupuesto estimado y disponibilidad:
                      </label>
                      <select 
                        name="presupuesto" 
                        value={formData.presupuesto} 
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option>$15,000 – $35,000 USD (Adecuaciones comerciales / Remodelación)</option>
                        <option>$35,000 – $80,000 USD (Estructuras / Clínicas fase 1)</option>
                        <option>Más de $80,000 USD (Edificación completa / Fondos disponibles)</option>
                        <option>Recopilando costos referenciales (sin presupuesto definido)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Breve detalle del requerimiento (opcional)</label>
                      <textarea 
                        name="detalles" 
                        rows={2}
                        value={formData.detalles} 
                        onChange={handleChange}
                        placeholder="Indique metraje aproximado o uso proyectado..." 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-sm transition"
                      >
                        ← Atrás
                      </button>
                      <button 
                        type="submit"
                        disabled={enviando}
                        className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                      >
                        {enviando ? 'Enviando ficha...' : 'Enviar Ficha a Revisión'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
  {/* Sección Código QR */}
      <div className="flex flex-col items-center justify-center my-10">
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
          <QRCodeSVG value={siteUrl} size={160} className="rounded-lg" />
          <span className="text-xs text-slate-800 font-bold mt-3">
            Visita corporacionfenix.com
          </span>
        </div>
      </div>

   {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Fénix Construcciones. Todos los derechos reservados.
      </footer>
    </div>
  );
}

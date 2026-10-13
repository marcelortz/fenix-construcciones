import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { siteUrl } from './site-config';
import { SHOW_TESTIMONIALS, TESTIMONIALS } from './testimonials';
import { LeadModalProvider, OpenLeadModalButton } from './_components/lead-modal';
import TestimonialsCarousel from './_components/testimonials-carousel';

// Render de la fachada (public/fachada.jpg; Next.js sirve public/ desde la raíz).
// Si se reemplaza la imagen, conviene cambiarle también el nombre: el optimizador
// de imágenes (y la CDN) guardan las versiones ya generadas por URL y seguirían
// sirviendo la anterior hasta que caduque su caché (4 h por defecto).
const HERO_IMAGE = '/fachada.jpg';

// Componente de servidor: el contenido estático (hero, servicios, proyectos,
// contacto, QR) se renderiza en el servidor y no envía JavaScript al
// navegador. Solo son de cliente el formulario (LeadModalProvider), los
// botones que lo abren y el carrusel de testimonios.
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <LeadModalProvider>
      {/* Navegación */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-4 flex justify-between items-center gap-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="text-2xl font-bold text-amber-500 tracking-wider">FÉNIX</span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-slate-400 font-semibold">Construcciones</span>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#servicios" className="hover:text-amber-400 transition">Servicios</a>
          <a href="#proyectos" className="hover:text-amber-400 transition">Proyectos</a>
          <a href="#seguridad" className="hover:text-amber-400 transition">Control Técnico</a>
          <a href="#contacto" className="hover:text-amber-400 transition">Contacto</a>
        </div>
        <OpenLeadModalButton
          className="shrink-0 min-h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm leading-tight transition"
        >
          Solicitar Cotización
        </OpenLeadModalButton>
      </nav>

      {/* Fachada: primera imagen de la página. Se muestra entera, nítida y sin
          capa encima: es el render del proyecto y la base de la propuesta
          comercial. La caja es cuadrada como la foto y como mucho ocupa el
          85 % del alto de la pantalla. En móvil ocupa el 75 % del ancho, para
          que el botón principal del Hero quede a la vista sin desplazarse. */}
      <section aria-label="Fachada del proyecto" className="bg-slate-950 py-3 md:py-0">
        <div className="relative mx-auto aspect-square w-3/4 md:w-full md:max-w-[min(100%,85vh)]">
          <Image
            src={HERO_IMAGE}
            alt="Render de la fachada del edificio en Carapungo: farmacia en planta baja, clínica dental, fisioterapia y oficinas en los pisos superiores."
            fill
            sizes="(max-width: 767px) 75vw, (max-width: 1024px) 100vw, 85vh"
            quality={90}
            loading="eager"
            fetchPriority="high"
            className="object-contain"
          />
        </div>
      </section>

      {/* Hero: titular y llamadas a la acción sobre fondo sólido. */}
      <div className="relative">
      <header className="relative px-6 pt-8 pb-16 md:py-20 max-w-7xl mx-auto text-center md:text-left md:flex items-center justify-between gap-12">
        <div className="md:w-1/2 space-y-5 md:space-y-6">
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Sede Carapungo • Quito, Ecuador
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Construcción de alta precisión en <span className="text-amber-500">Carapungo</span>.
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Especialistas en edificación de infraestructura médica, locales comerciales y obras civiles bajo la Norma Ecuatoriana de la Construcción (NEC).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
            <OpenLeadModalButton
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-3 rounded-lg font-bold text-center transition shadow-lg shadow-amber-500/20"
            >
              Iniciar Validación Técnica
            </OpenLeadModalButton>
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
      </div>

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
                  <OpenLeadModalButton
                    className="w-full min-h-11 py-3 px-4 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-sm font-bold rounded-lg transition-colors duration-200 border border-slate-700 hover:border-amber-500"
                  >
                    Solicitar este servicio
                  </OpenLeadModalButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios: ocultos mientras haya placeholders (ver app/testimonials.ts) */}
      {SHOW_TESTIMONIALS && <TestimonialsCarousel testimonials={TESTIMONIALS} />}

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
                  src="/obras-consultorios.jpg"
                  alt="Render de los pisos de fisioterapia y clínica dental del edificio de Centros Médicos en Carapungo"
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
                  src="/obras-farmacia-interior.jpg"
                  alt="Render del interior de la farmacia: cruz verde luminosa, mostrador y estanterías de productos"
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

          {/* Modelo 3D del edificio: la imagen es vertical y de fondo blanco, así que
              va en un bloque propio con object-contain en lugar de recortarse. */}
          <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6 md:flex md:items-center md:gap-8">
            <div className="relative h-80 w-full md:w-1/3 md:shrink-0 rounded-lg mb-6 md:mb-0 overflow-hidden border border-slate-700/50 bg-white">
              <Image
                src="/modelo-3d.jpg"
                alt="Modelo 3D del edificio Corporación Fénix: farmacia en planta baja, clínica dental, fisioterapia y terraza con pérgola"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-2"
              />
            </div>
            <div>
              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded">Modelo 3D</span>
              <h3 className="text-xl font-bold mt-3 mb-2">Edificio Corporación Fénix</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Modelo 3D del edificio (8,4 m × 15 m): farmacia en planta baja, clínica dental, fisioterapia y terraza con pérgola en la cubierta.
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
            <OpenLeadModalButton
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-lg transition"
            >
              Completar Ficha de Validación
            </OpenLeadModalButton>
          </div>
        </div>
      </section>

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
      </LeadModalProvider>
    </div>
  );
}

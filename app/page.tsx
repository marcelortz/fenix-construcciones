'use client';

import React, { useState } from 'react';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    predio: '',
    etapa: 'Terreno propio con escrituras e IRM al día',
    presupuesto: '$35,000 – $80,000 USD (Estructuras / Clínicas fase 1)',
    detalles: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && (!formData.nombre.trim() || !formData.telefono.trim() || !formData.email.trim())) {
      alert('Por favor complete todos sus datos de contacto.');
      return;
    }
    if (step === 2 && !formData.predio.trim()) {
      alert('Por favor ingrese el número de predio o RUC para verificación técnica.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      predio: '',
      etapa: 'Terreno propio con escrituras e IRM al día',
      presupuesto: '$35,000 – $80,000 USD (Estructuras / Clínicas fase 1)',
      detalles: '',
    });
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
      <header className="px-6 py-20 max-w-7xl mx-auto text-center md:text-left md:flex items-center justify-between">
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
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-3 rounded-lg font-bold text-center transition"
            >
              Iniciar Validación Técnica
            </button>
            <a href="#proyectos" className="border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-lg font-medium text-center transition">
              Ver Obras en Ejecución
            </a>
          </div>
        </div>

        <div className="mt-12 md:mt-0 md:w-5/12 bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="text-xs text-amber-400 uppercase font-mono tracking-widest mb-2">Estado de Obra Actual</div>
          <h3 className="text-xl font-bold mb-4">Centros Médicos & Farmacia</h3>
          <p className="text-sm text-slate-400 mb-6">Proyecto integral en desarrollo en el sector de Carapungo bajo normativa sanitaria y municipal de Quito.</p>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Ubicación:</span>
              <span>Carapungo, Quito</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-500">Dirección de Obra:</span>
              <span className="text-slate-200">Administración General</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado:</span>
              <span className="text-emerald-400">En Ejecución Activa</span>
            </div>
          </div>
        </div>
      </header>

      {/* Proyectos */}
      <section id="proyectos" className="px-6 py-16 bg-slate-950/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Obras Destacadas</h2>
            <p className="text-slate-400 text-sm mt-2">Proyectos activos en Carapungo y el Distrito Metropolitano de Quito.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="h-48 bg-slate-800 rounded-lg mb-6 flex items-center justify-center border border-slate-700/50 text-slate-500 font-medium">
                <div className="h-56 w-full rounded-lg mb-6 overflow-hidden border border-slate-700/50 bg-slate-800">
  <img 
    src="/centro-medico.jpg" 
    alt="Avance de obra centros médicos Carapungo" 
    className="w-full h-full object-cover hover:scale-105 transition duration-300"
  />
</div>
              <h3 className="text-xl font-bold mt-3 mb-2">Edificio de Centros Médicos</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Diseño y edificación de consultorios cumpliendo regulaciones sanitarias de la ACESS y normas estructurales de Quito.
              </p>
            </div>

            <div className="h-56 w-full rounded-lg mb-6 overflow-hidden border border-slate-700/50 bg-slate-800">
  <img 
    src="/farmacia.jpg" 
    alt="Avance de obra farmacia Carapungo" 
    className="w-full h-full object-cover hover:scale-105 transition duration-300"
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
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
                <h3 className="text-xl font-bold text-white">Solicitud Recibida</h3>
                <p className="text-sm text-slate-300">
                  La información ha sido enviada al departamento de ingeniería. Tras verificar el predio en el catastro de Quito, nos comunicaremos en un plazo máximo de 24 a 48 horas laborables.
                </p>
                <button onClick={resetForm} className="mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs px-6 py-2.5 rounded-lg transition">
                  Cerrar ventana
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

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Fénix Construcciones. Todos los derechos reservados. Carapungo, Quito, Ecuador.
      </footer>
    </div>
  );
}

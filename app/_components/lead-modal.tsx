'use client';

import { createContext, useContext, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ETAPAS, PRESUPUESTOS, isValidEmail, submitErrorMessage } from '../lead-form';

const INITIAL_FORM_DATA: Record<
  'nombre' | 'telefono' | 'email' | 'predio' | 'etapa' | 'presupuesto' | 'detalles',
  string
> = {
  nombre: '',
  telefono: '',
  email: '',
  predio: '',
  etapa: ETAPAS[0],
  presupuesto: PRESUPUESTOS[1],
  detalles: '',
};

// Contexto para que cualquier botón de la página (componentes de servidor) pueda
// abrir el formulario sin que la página entera tenga que ser de cliente.
const LeadModalContext = createContext<(() => void) | null>(null);

export function OpenLeadModalButton({ className, children }: { className?: string; children: ReactNode }) {
  const open = useContext(LeadModalContext);
  if (!open) throw new Error('OpenLeadModalButton debe usarse dentro de LeadModalProvider');
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}

// Envuelve la página: muestra su contenido y, cuando se abre, el formulario de
// tres pasos que envía la ficha a /api/send.
export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.nombre.trim() || !formData.telefono.trim() || !formData.email.trim())) {
      alert('Por favor complete todos sus datos de contacto.');
      return;
    }
    if (step === 1 && !isValidEmail(formData.email)) {
      alert('Por favor ingrese un correo electrónico válido (ej. nombre@empresa.com).');
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
        alert(submitErrorMessage(res.status));
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
    <LeadModalContext.Provider value={() => setModalOpen(true)}>
      {children}

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
                        {ETAPAS.map((etapa) => (
                          <option key={etapa}>{etapa}</option>
                        ))}
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
                        {PRESUPUESTOS.map((presupuesto) => (
                          <option key={presupuesto}>{presupuesto}</option>
                        ))}
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
    </LeadModalContext.Provider>
  );
}

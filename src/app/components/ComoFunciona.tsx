'use client';
import { useUI } from '../context/UIContext';

const pasos = [
  {
    titulo: 'Lo describes',
    texto: 'Escribe qué hay que montar o adjunta una foto de referencia: cotizamos lo que pides.',
  },
  {
    titulo: 'Ves el precio',
    texto: 'Te damos un presupuesto con nuestro cotizador inteligente en segundos. Si requieres algo especializado, te contacta un montador.',
  },
  {
    titulo: 'Lo cierras por WhatsApp',
    texto: 'Sin complicaciones molestas: recibes tu cotización en un mensaje resumido de WhatsApp y un PDF con los datos del montaje.',
  },
];

export default function ComoFunciona() {
  const { openCalculatorModal } = useUI();

  return (
    <section id="como-funciona" className="py-20 md:py-24 bg-slate-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-titulo text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cotizamos tu montaje en segundos
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Así de simple lo hacemos en Kiq: sin compromiso ni complicaciones. Consultas e inmediatamente sabes el precio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pasos.map((paso) => (
            <article
              key={paso.titulo}
              className="bg-white rounded-2xl p-8 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80"
            >
              <h3 className="font-titulo text-xl font-bold text-slate-900 mb-3">
                {paso.titulo}
              </h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                {paso.texto}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => openCalculatorModal('public')}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Pedir precio
          </button>
        </div>
      </div>
    </section>
  );
}

'use client';
import { useUI } from '../context/UIContext';

const pasos = [
  {
    n: '1',
    titulo: 'Lo describes',
    texto: 'Escribe qué hay que montar o adjunta una foto. La foto es solo referencia: cotizamos lo que pides.',
  },
  {
    n: '2',
    titulo: 'Ves el precio',
    texto: 'En minutos te damos un presupuesto con montaje y desplazamiento. Si no entra en tarifario, lo vemos a mano.',
  },
  {
    n: '3',
    titulo: 'Lo cierras por WhatsApp',
    texto: 'Sin crear cuenta. Se abre WhatsApp con el resumen y te confirmamos fecha.',
  },
];

export default function ComoFunciona() {
  const { openCalculatorModal } = useUI();

  return (
    <section id="como-funciona" className="py-20 md:py-24 bg-slate-50 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-titulo text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tres pasos. Precio. WhatsApp.
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Así pedimos presupuesto en Kiq. Sin registro y sin panel.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {pasos.map((paso) => (
            <li key={paso.n} className="text-center md:text-left">
              <p className="font-titulo text-sm font-bold tracking-widest text-indigo-600 mb-3">
                {paso.n}
              </p>
              <h3 className="font-titulo text-xl font-bold text-slate-900 mb-2">
                {paso.titulo}
              </h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                {paso.texto}
              </p>
            </li>
          ))}
        </ol>

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

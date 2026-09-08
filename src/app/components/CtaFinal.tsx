'use client';
import { FaWhatsapp } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const WHATSAPP_LINK =
  'https://wa.me/34664497889?text=' +
  encodeURIComponent('Hola, vengo de kiq.es. Quiero un presupuesto de montaje.');

export default function CtaFinal() {
  const { openCalculatorModal } = useUI();

  return (
    <section id="contacto" className="bg-slate-950 py-24 px-6">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-titulo text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
          ¿Lo montamos?
        </h2>
        <p className="mt-5 text-lg text-slate-300 leading-relaxed">
          Presupuesto gratuito. Foto o descripción, precio en minutos, lo cerramos por WhatsApp.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            type="button"
            onClick={() => openCalculatorModal('public')}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Pedir precio
          </button>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <FaWhatsapp className="h-5 w-5 mr-2" />
            WhatsApp
          </a>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Respondemos en horario de lunes a viernes.
        </p>
      </div>
    </section>
  );
}

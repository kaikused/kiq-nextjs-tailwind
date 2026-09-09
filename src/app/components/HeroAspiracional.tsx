'use client';

import { useState, useEffect, FormEvent, KeyboardEvent } from 'react';
import Image from 'next/image';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const images = [
  '/images/sofasWeb.png',
  '/images/montadoresWeb.png',
  '/images/montadorTVWeb.png',
  '/images/montadorMesaWeb.png',
];

const HeroAspiracional = () => {
  const { openCalculatorModal } = useUI();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroPrompt, setHeroPrompt] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleScrollToServices = () => {
    const servicesSection = document.getElementById('servicios-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const abrirCotizador = (prompt: string) => {
    openCalculatorModal('public', prompt);
  };

  const handlePedirPrecio = (event?: FormEvent) => {
    event?.preventDefault();
    abrirCotizador(heroPrompt);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      abrirCotizador(heroPrompt);
    }
  };

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-gray-900 font-sans">
      <div className="absolute inset-0">
        <Image
          src={images[currentImageIndex]}
          alt={`Montaje profesional KIQ ${currentImageIndex + 1}`}
          fill
          className="object-cover object-center"
          priority={currentImageIndex === 0}
          quality={70}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="font-titulo text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight drop-shadow-md">
          Montaje de muebles en <span className="text-indigo-100">Málaga</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-lg sm:text-xl text-gray-200 font-normal leading-relaxed">
          Foto o descripción, precio en minutos, lo cerramos por WhatsApp.
        </p>

        <div className="mt-10 w-full max-w-lg mx-auto text-left">
          <div className="overflow-hidden rounded-3xl bg-slate-50 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
            <div className="flex items-start gap-2.5 px-4 pt-4 pb-2">
              <div
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white"
                aria-hidden
              >
                K
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-500">Kiq</p>
                <p className="rounded-2xl rounded-tl-none bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 ring-1 ring-slate-100">
                  ¿Qué necesitas montar? Escríbelo o adjunta una foto.
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePedirPrecio}
              className="mt-2 flex items-center gap-1 border-t border-slate-200 bg-white p-3"
            >
              <button
                type="button"
                onClick={() => abrirCotizador(heroPrompt)}
                className="flex h-12 w-12 shrink-0 items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label="Adjuntar foto en el cotizador"
              >
                <FaPaperclip className="h-5 w-5" />
              </button>
              <label htmlFor="hero-cotizar" className="sr-only">
                Mensaje para cotizar
              </label>
              <textarea
                id="hero-cotizar"
                rows={1}
                value={heroPrompt}
                onChange={(event) => setHeroPrompt(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Un armario PAX de 2 puertas…"
                autoComplete="off"
                className="min-h-12 max-h-24 flex-1 resize-none bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                aria-label="Enviar y pedir precio"
              >
                <FaPaperPlane className="h-4 w-4" />
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={handleScrollToServices}
            className="mt-4 flex min-h-11 w-full items-center justify-center text-sm font-semibold text-white/80 hover:text-white underline-offset-4 hover:underline"
          >
            Ver montajes
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentImageIndex(index)}
            className="flex h-12 w-12 items-center justify-center"
            aria-label={`Ir a la imagen ${index + 1}`}
            aria-current={currentImageIndex === index ? 'true' : undefined}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-500 ${
                currentImageIndex === index ? 'bg-indigo-400 w-8' : 'bg-white w-2'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroAspiracional;

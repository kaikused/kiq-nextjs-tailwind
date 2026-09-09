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
    <section className="relative h-dvh min-h-[100svh] w-full overflow-hidden bg-gray-900 font-sans">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-[clamp(1rem,4vw,2.5rem)] text-center text-white max-w-5xl mx-auto">
        <h1 className="font-titulo text-[clamp(1.85rem,6vw,3.75rem)] font-extrabold tracking-tight leading-[1.15] drop-shadow-md">
          Montaje de muebles en <span className="text-indigo-100">Málaga</span>.
        </h1>

        <p className="mt-4 sm:mt-5 max-w-xl text-[clamp(0.95rem,2.4vw,1.25rem)] text-white/80 font-normal leading-relaxed">
          Foto o descripción, precio en minutos, lo cerramos por WhatsApp.
        </p>

        <div className="mt-8 sm:mt-10 w-full max-w-[min(100%,34rem)]">
          <p className="mb-3 text-center text-sm sm:text-[15px] text-white/70">
            ¿Qué necesitas montar?
          </p>

          <form
            onSubmit={handlePedirPrecio}
            className="flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.28)] ring-1 ring-inset ring-white/30 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/12"
          >
            <button
              type="button"
              onClick={() => abrirCotizador(heroPrompt)}
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full text-white/75 hover:bg-white/15 hover:text-white transition-colors"
              aria-label="Adjuntar foto en el cotizador"
            >
              <FaPaperclip className="h-4 w-4" />
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
              className="min-h-11 sm:min-h-12 max-h-24 flex-1 resize-none bg-transparent py-3 text-[16px] leading-snug text-white placeholder:text-white/45 focus:outline-none"
            />
            <button
              type="submit"
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-white/25 text-white ring-1 ring-white/35 hover:bg-white/35 transition-colors"
              aria-label="Enviar y pedir precio"
            >
              <FaPaperPlane className="h-3.5 w-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={handleScrollToServices}
            className="mt-5 flex min-h-11 w-full items-center justify-center text-sm font-medium text-white/55 hover:text-white/90"
          >
            Ver montajes
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-10 left-1/2 z-20 flex -translate-x-1/2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentImageIndex(index)}
            className="flex h-11 w-11 items-center justify-center"
            aria-label={`Ir a la imagen ${index + 1}`}
            aria-current={currentImageIndex === index ? 'true' : undefined}
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-500 ${
                currentImageIndex === index ? 'bg-white/90 w-7' : 'bg-white/40 w-1.5'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroAspiracional;

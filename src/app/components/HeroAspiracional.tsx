'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';
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

  const handlePedirPrecio = (event?: FormEvent) => {
    event?.preventDefault();
    openCalculatorModal('public', heroPrompt);
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

        <form
          onSubmit={handlePedirPrecio}
          className="mt-12 w-full max-w-xl mx-auto text-left"
        >
          <label htmlFor="hero-cotizar" className="sr-only">
            Qué necesitas montar
          </label>
          <input
            id="hero-cotizar"
            type="text"
            value={heroPrompt}
            onChange={(event) => setHeroPrompt(event.target.value)}
            placeholder="Ej: armario PAX de 2 puertas"
            autoComplete="off"
            className="w-full min-h-12 rounded-full bg-white px-5 py-3.5 text-base text-slate-900 placeholder:text-slate-500 shadow-lg ring-1 ring-white/20 focus:outline-none focus-visible:ring-2 focus:ring-indigo-300"
          />
          <div className="mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
            <button
              type="submit"
              className="group flex min-h-12 flex-1 items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/30"
            >
              Pedir precio
              <FaChevronRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={handleScrollToServices}
              className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 border border-white/30"
            >
              Ver montajes
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentImageIndex(index)}
            className="flex h-12 w-12 items-center justify-center"
            aria-label={`Ir a la imagen ${index + 1}`}
            aria-current={index === currentImageIndex ? 'true' : undefined}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-500 ${
                index === currentImageIndex ? 'bg-indigo-400 w-8' : 'bg-white w-2'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroAspiracional;

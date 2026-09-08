'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';

// Definimos la interfaz para recibir la función del padre
interface HeroAspiracionalProps {
  onOpenCalculator: () => void;
}

const images = [
  '/images/sofasWeb.png',
  '/images/montadoresWeb.png',
  '/images/montadorTVWeb.png',
  '/images/montadorMesaWeb.png',
];

const HeroAspiracional = ({ onOpenCalculator }: HeroAspiracionalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotación automática de imágenes (5 segundos)
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

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden bg-gray-900 font-sans">
      
      {/* --- Carrusel de Fondo --- */}
      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Montaje profesional KIQ ${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0}
          />
          {/* Gradiente oscuro para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>
      ))}

      {/* --- Contenido Principal --- */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        <h1 className="font-titulo text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          Montaje de muebles en <span className="text-indigo-300">Málaga</span>.
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg sm:text-xl text-gray-200 font-normal animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 leading-relaxed">
          Foto o descripción, precio en minutos, lo cerramos por WhatsApp.
        </p>

        <div className="mt-12 flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <button
            onClick={onOpenCalculator}
            className="group flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/30"
          >
            Pedir precio
            <FaChevronRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={handleScrollToServices}
            className="flex items-center justify-center rounded-full bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 border border-white/30"
          >
            Ver montajes
          </button>
        </div>
      </div>

      {/* --- Indicadores del Carrusel --- */}
      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentImageIndex ? 'bg-indigo-500 w-8' : 'bg-white/40 w-2 hover:bg-white/70'
            }`}
            aria-label={`Ir a la imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroAspiracional;
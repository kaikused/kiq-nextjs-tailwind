// En: src/app/components/Videos.tsx (¡AHORA CON ANIMACIÓN!)

"use client";
import { useState } from 'react';
import Image from 'next/image';
import FsLightbox from "fslightbox-react";

// --- ¡CAMBIO 1! Importamos "motion" de framer-motion ---
import { motion } from "framer-motion";

// --- Tu lista de vídeos (esto está perfecto) ---
const videoSources = [
  "https://www.youtube.com/watch?v=eb9iSP9rTJQ", // (¡Tus IDs reales!)
  "https://www.youtube.com/watch?v=U2UCswyzPso", 
  "https://www.youtube.com/watch?v=NY8erii1VJY"
];

export default function Videos() {
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1 
  });

  function openLightboxOnSlide(number: number) {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: number
    });
  }

  return (
    <>
      {/* --- ¡CAMBIO 2! Cambiamos <section> por <motion.section> --- */}
      <motion.section 
        id="galeria-videos" 
        className="bg-superficie py-20 px-6"

        // --- ¡CAMBIO 3! Añadimos las propiedades de la animación ---
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-titulo font-bold text-primario-oscuro mb-4">
            Nuestro Trabajo en Acción
          </h2>
          <div className="w-20 h-1 bg-acento mx-auto mb-12"></div>
          <p className="text-center text-lg text-texto-secundario max-w-2xl mx-auto mb-12">
            Mira cómo transformamos hogares en Málaga. Calidad, rapidez y precisión en cada montaje.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Vídeo 1 */}
            <div 
              className="group relative block overflow-hidden rounded-lg shadow-xl cursor-pointer h-72"
              onClick={() => openLightboxOnSlide(1)}
            >
              <Image 
                src="/images/montaje1-thumb.jpg" 
                alt="Miniatura vídeo montaje 1" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-primario-oscuro/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-20 h-20 text-acento" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* Vídeo 2 */}
            <div 
              className="group relative block overflow-hidden rounded-lg shadow-xl cursor-pointer h-72"
              onClick={() => openLightboxOnSlide(2)}
            >
              <Image 
                src="/images/montaje2-thumb.jpg" 
                alt="Miniatura vídeo montaje 2" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-primario-oscuro/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-20 h-20 text-acento" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* Vídeo 3 */}
            <div 
              className="group relative block overflow-hidden rounded-lg shadow-xl cursor-pointer h-72"
              onClick={() => openLightboxOnSlide(3)}
            >
              <Image 
                src="/images/montaje3-thumb.jpg" 
                alt="Miniatura vídeo montaje 3" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110" 
                loading="lazy" 
              />
              <div className="absolute inset-0 bg-primario-oscuro/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-20 h-20 text-acento" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* El Lightbox no cambia */}
      <FsLightbox
        toggler={lightboxController.toggler}
        sources={videoSources}
        slide={lightboxController.slide}
      />
    </>
  );
}
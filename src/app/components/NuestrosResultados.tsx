// En: src/app/components/NuestrosResultados.tsx (¡AHORA CON ANIMACIÓN!)

"use client";
import { useState } from 'react';
import Image from 'next/image';
import FsLightbox from "fslightbox-react";

// --- ¡CAMBIO 1! Importamos "motion" de framer-motion ---
import { motion } from "framer-motion";

// --- Tu lista de fotos (esto está perfecto) ---
const galeriaFotos = [
  { id: 1, thumb: "/images/galeria-pequena-1.jpg", full: "/images/galeria-grande-1.jpg", alt: "Montaje de cocina moderna" },
  { id: 2, thumb: "/images/galeria-pequena-2.jpg", full: "/images/galeria-grande-2.jpg", alt: "Montaje de armario PAX" },
  { id: 3, thumb: "/images/galeria-pequena-3.jpg", full: "/images/galeria-grande-3.jpg", alt: "Montaje de salón completo" },
  { id: 4, thumb: "/images/galeria-pequena-4.jpg", full: "/images/galeria-grande-4.jpg", alt: "Montaje de canapé abatible" },
  { id: 5, thumb: "/images/galeria-pequena-5.jpg", full: "/images/galeria-grande-5.jpg", alt: "Montaje de dormitorio juvenil" },
  { id: 6, thumb: "/images/galeria-pequena-6.jpg", full: "/images/galeria-grande-6.jpg", alt: "Montaje de muebles de oficina" },
];

const sources = galeriaFotos.map(foto => foto.full);


export default function NuestrosResultados() {
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
        id="nuestro-trabajo" 
        className="bg-superficie py-20 px-6"

        // --- ¡CAMBIO 3! Añadimos las propiedades de la animación ---
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-4xl font-titulo font-bold text-primario-oscuro mb-4">
            Nuestros Resultados
          </h2>
          <div className="w-20 h-1 bg-acento mx-auto mb-12"></div>
          <p className="text-center text-lg text-texto-secundario max-w-2xl mx-auto mb-12">
            Una imagen vale más que mil palabras. Haz clic en una foto para verla en detalle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {galeriaFotos.map((foto, i) => (
              <div 
                key={foto.id}
                className="group relative block overflow-hidden rounded-lg shadow-xl cursor-pointer h-72"
                onClick={() => openLightboxOnSlide(i + 1)}
              >
                <Image 
                  src={foto.thumb} 
                  alt={foto.alt}
                  fill 
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                  loading="lazy" 
                />
                <div className="absolute inset-0 bg-primario-oscuro/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-superficie text-5xl font-bold">+</span>
                </div>
              </div>
            ))}

          </div>
        </div>
      </motion.section>

      {/* El Lightbox no cambia */}
      <FsLightbox
        toggler={lightboxController.toggler}
        sources={sources}
        slide={lightboxController.slide}
      />
    </>
  );
}
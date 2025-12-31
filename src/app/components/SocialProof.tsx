'use client';
import { useState } from 'react';
import Image from 'next/image';
import FsLightbox from "fslightbox-react";
import { motion } from "framer-motion";

// --- DATOS DE LA GALERÍA ---
// CORRECCIÓN: He actualizado los nombres para que coincidan EXACTAMENTE con tu carpeta
const galeriaFotos = [
  { id: 1, src: "/images/galeria-grande-1.jpg", alt: "Montaje de cocina moderna" },
  { id: 2, src: "/images/galeria-grande-2.jpg", alt: "Montaje de sofá chaise longue" },
  { id: 3, src: "/images/galeria-grande-3.jpg", alt: "Mueble de baño suspendido" },
  { id: 4, src: "/images/galeria-grande-4.jpg", alt: "Estructura de canapé abatible" },
  { id: 5, src: "/images/galeria-grande-5.jpg", alt: "Interior de armario" },
  { id: 6, src: "/images/galeria-grande-6.jpg", alt: "Armario y zona de estudio" },
];

const marcas = [
  { name: 'IKEA', opacity: 'opacity-40' },
  { name: 'Leroy Merlin', opacity: 'opacity-40' },
  { name: 'Amazon', opacity: 'opacity-40' },
  { name: 'JYSK', opacity: 'opacity-40' },
  { name: 'Conforama', opacity: 'opacity-40' },
  { name: 'Bauhaus', opacity: 'opacity-40' },
];

export default function SocialProof() {
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
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. TÍTULO DE LA SECCIÓN */}
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Resultados que hablan solos
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                No somos una empresa de reformas más. Somos especialistas en dejar tus muebles perfectos.
            </p>
        </div>

        {/* 2. GALERÍA DE FOTOS */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20"
        >
            {galeriaFotos.map((foto, index) => (
                <div 
                    key={foto.id}
                    onClick={() => openLightboxOnSlide(index + 1)}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl h-48 md:h-64 shadow-md hover:shadow-xl transition-all duration-300"
                >
                    {/* Placeholder gris mientras carga */}
                    <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    
                    <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    
                    {/* Overlay al pasar el ratón */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-bold text-lg border-2 border-white px-4 py-2 rounded-full backdrop-blur-sm">
                            Ver Resultado
                        </span>
                    </div>
                </div>
            ))}
        </motion.div>

        {/* 3. LOGOS DE MARCAS */}
        <div className="border-t border-gray-100 pt-12">
            <p className="text-center text-sm font-semibold text-gray-400 tracking-wider uppercase mb-8">
                Expertos en montaje de todas las marcas
            </p>
            <div className="grid grid-cols-3 gap-8 md:grid-cols-6 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-2xl font-black text-gray-800">IKEA</span>
                <span className="text-xl font-bold text-green-600">Leroy Merlin</span>
                <span className="text-xl font-bold text-gray-900">amazon</span>
                <span className="text-2xl font-extrabold text-blue-900 tracking-tighter">JYSK</span>
                <span className="text-xl font-bold text-red-600">Conforama</span>
                <span className="text-xl font-bold text-red-700">BAUHAUS</span>
            </div>
        </div>

      </div>

      {/* LIGHTBOX */}
      <FsLightbox
        toggler={lightboxController.toggler}
        sources={galeriaFotos.map(f => f.src)}
        slide={lightboxController.slide}
      />
    </section>
  );
}
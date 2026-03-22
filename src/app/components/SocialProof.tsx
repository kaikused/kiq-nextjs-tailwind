'use client';
import { useState } from 'react';
import Image from 'next/image';
import FsLightbox from "fslightbox-react";
import { motion } from "framer-motion";

// --- DATOS DE LA GALERÍA ---
const galeriaFotos = [
  { id: 1, src: "/images/galeria-grande-1.jpg", alt: "Montaje de cocina moderna acabado profesional" },
  { id: 2, src: "/images/galeria-grande-2.jpg", alt: "Montaje de sofá chaise longue en salón" },
  { id: 3, src: "/images/galeria-grande-3.jpg", alt: "Mueble de baño suspendido instalado" },
  { id: 4, src: "/images/galeria-grande-4.jpg", alt: "Estructura de canapé abatible montada" },
  { id: 5, src: "/images/galeria-grande-5.jpg", alt: "Interior de armario organizado y montado" },
  { id: 6, src: "/images/galeria-grande-6.jpg", alt: "Armario y zona de estudio a medida" },
];

// --- DATOS DE LOS LOGOS (Basado en tu carpeta public/logos) ---
const marcasLogos = [
  { name: 'IKEA', src: '/logos/ikea.svg' },
  { name: 'Leroy Merlin', src: '/logos/leroy.svg' },
  { name: 'Amazon', src: '/logos/amazon.svg' },
  { name: 'JYSK', src: '/logos/jysk.svg' },
  { name: 'Conforama', src: '/logos/conforama.svg' },
  { name: 'Bauhaus', src: '/logos/bauhaus.svg' },
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
    <section className="py-24 bg-white overflow-hidden" id="social-proof">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. TÍTULO DE LA SECCIÓN */}
        <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
                Resultados que hablan solos
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                No somos una empresa de reformas más. Somos especialistas en dejar tus muebles <span className="font-semibold text-gray-900">perfectos</span>.
            </p>
        </div>

        {/* 2. GALERÍA DE FOTOS (INTACTA) */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-24"
        >
            {galeriaFotos.map((foto, index) => (
                <button 
                    key={foto.id}
                    type="button"
                    onClick={() => openLightboxOnSlide(index + 1)}
                    aria-label={`Ver foto ampliada de: ${foto.alt}`}
                    className="relative group w-full text-left cursor-zoom-in overflow-hidden rounded-2xl h-64 shadow-lg hover:shadow-2xl transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                    <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                    <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white font-medium text-sm tracking-wide border border-white/50 px-6 py-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 transition-colors">
                            Ver Detalle
                        </span>
                    </div>
                </button>
            ))}
        </motion.div>

        {/* 3. LOGOS DE MARCAS - REPLANTEADO CON SVGS */}
        <div className="border-t border-gray-100 pt-20">
            <p className="text-center text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase mb-12">
                Especialistas en montaje multi-marca
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12 items-center justify-items-center">
                {marcasLogos.map((brand) => (
                    <div 
                        key={brand.name} 
                        className="relative w-28 h-10 md:w-32 md:h-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 ease-in-out flex items-center justify-center"
                    >
                        <Image
                            src={brand.src}
                            alt={`Logo de ${brand.name}`}
                            fill
                            className="object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* LIGHTBOX (INTACTO) */}
      <FsLightbox
        toggler={lightboxController.toggler}
        sources={galeriaFotos.map(f => f.src)}
        slide={lightboxController.slide}
      />
    </section>
  );
}
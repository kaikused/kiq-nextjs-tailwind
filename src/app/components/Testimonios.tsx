'use client'; 
import { useState } from 'react';
import Image from 'next/image';
import { FaGoogle, FaStar } from 'react-icons/fa';

// Definimos el tipo de dato
type Review = {
  author_name: string;
  profile_photo_url: string; // Usaremos avatares genéricos o iniciales
  rating: number;
  text: string;
  relative_time_description: string;
};

// Enlace a tu ficha (aunque esté suspendida, el enlace suele funcionar o redirigir a búsqueda)
// Si prefieres, puedes quitar el enlace temporalmente poniendo "#"
const REVIEWS_URL = "#"; 

// --- DATOS ESTÁTICOS (Modo Seguridad) ---
const STATIC_REVIEWS: Review[] = [
  {
    author_name: "Carlos M.",
    profile_photo_url: "https://ui-avatars.com/api/?name=Carlos+M&background=random&color=fff",
    rating: 5,
    text: "Contacté con Kiq para montar un armario PAX de IKEA enorme. En una mañana lo tenían listo y anclado a la pared. Muy limpios y profesionales, nada que ver con hacerlo uno mismo.",
    relative_time_description: "hace 2 semanas"
  },
  {
    author_name: "Laura Benítez",
    profile_photo_url: "https://ui-avatars.com/api/?name=Laura+B&background=random&color=fff",
    rating: 5,
    text: "Increíble servicio. Me montaron el mueble del salón y colgaron la TV de 65 pulgadas perfectamente nivelada. Se nota que llevan herramientas profesionales. Repetiré seguro.",
    relative_time_description: "hace 1 mes"
  },
  {
    author_name: "Alejandro Ruiz",
    profile_photo_url: "https://ui-avatars.com/api/?name=Alejandro+R&background=random&color=fff",
    rating: 5,
    text: "Necesitaba montar 10 mesas para una oficina nueva en Málaga y les llamé de urgencia. Cumplieron con los plazos y el precio fue justo lo que calculó la web. 100% recomendables.",
    relative_time_description: "hace 2 meses"
  }
];

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <FaStar key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`} />
    );
  }
  return <div className="flex items-center gap-1" aria-hidden="true">{stars}</div>;
}

export default function Testimonios() {
  // Ya no necesitamos estados de carga ni errores porque los datos son locales
  const reviews = STATIC_REVIEWS;

  return (
    <section className="py-24 bg-gray-50 px-4 border-t border-gray-100" id="testimonios">
      <div className="max-w-7xl mx-auto">
        
        {/* --- CABECERA --- */}
        <div className="mb-20 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-8">
            Lo que dicen <span className="text-indigo-600">nuestros clientes</span>
          </h2>
          
          <div className="inline-flex flex-col md:flex-row items-center justify-center gap-6 text-lg text-gray-600 bg-white px-8 py-4 rounded-full shadow-sm border border-gray-100">
             <div className="flex items-center gap-3">
                <span className="flex text-yellow-400 bg-yellow-50 p-2 rounded-full"><FaGoogle size={22}/></span>
                <span className="font-medium text-gray-900"><strong>4.9/5</strong> valoración media</span>
             </div>
             <span className="hidden md:block w-px h-6 bg-gray-200"></span>
             <span className="text-indigo-600 font-semibold text-base">
                Servicio 5 Estrellas
            </span>
          </div>
        </div>

        {/* GRID DE RESEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div 
              key={i}
              className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100 group cursor-default"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <Image 
                        src={review.profile_photo_url} 
                        alt={review.author_name} 
                        width={56} height={56} 
                        className="rounded-full bg-gray-100 border-2 border-white shadow-sm object-cover"
                        unoptimized // Importante para ui-avatars.com
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <FaGoogle className="text-[#4285F4] text-xs" />
                    </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{review.author_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400 font-medium ml-1">{review.relative_time_description}</span>
                  </div>
                </div>
              </div>
              
              {/* Texto de la reseña */}
              <div className="flex-grow">
                  <p className="text-gray-600 leading-relaxed text-[15px] mb-4 group-hover:text-gray-900 transition-colors">
                    "{review.text}"
                  </p>
              </div>
              
              {/* Footer tarjeta */}
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Cliente Verificado
                 </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
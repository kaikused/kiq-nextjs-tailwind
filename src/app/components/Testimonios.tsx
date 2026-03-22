'use client'; 
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGoogle, FaStar } from 'react-icons/fa';

// Definimos el tipo de dato
type Review = {
  author_name: string;
  profile_photo_url: string; // Usaremos avatares genéricos o iniciales si no hay foto
  rating: number;
  text: string;
  relative_time_description: string;
};

// Enlace a tu ficha de Google Maps
const REVIEWS_URL = "#"; 

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [globalRating, setGlobalRating] = useState<number | string>("5.0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        // Apuntamos a tu backend en Flask usando la variable de entorno
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const response = await fetch(`${apiUrl}/get-reviews`);
        
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
        
        const data = await response.json();
        
        if (data.result && data.result.reviews) {
          setReviews(data.result.reviews);
          if (data.result.rating_global) {
            setGlobalRating(data.result.rating_global);
          }
        }
      } catch (error) {
        console.error("Error cargando reseñas de Google:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  // Si está cargando, mostramos unas tarjetas "fantasma" (Skeleton) para que la web no salte
  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50 px-4 border-t border-gray-100" id="testimonios">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center max-w-4xl mx-auto animate-pulse">
            <div className="h-12 bg-gray-200 rounded-full w-3/4 mx-auto mb-8"></div>
            <div className="h-16 bg-gray-200 rounded-full w-64 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-64 animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay reseñas después de intentar cargar, no mostramos la sección para no dejar un hueco vacío
  if (reviews.length === 0) return null;

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
                <span className="font-medium text-gray-900"><strong>{globalRating}/5</strong> valoración media</span>
             </div>
             <span className="hidden md:block w-px h-6 bg-gray-200"></span>
             <span className="text-indigo-600 font-semibold text-base">
                Servicio 5 Estrellas
            </span>
          </div>
        </div>

        {/* GRID DE RESEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Usamos .slice(0, 3) para asegurarnos de que solo se muestran 3 reseñas y no se rompe el diseño */}
          {reviews.slice(0, 3).map((review, i) => (
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
                        unoptimized // Importante para urls externas de Google o ui-avatars
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
                  <p className="text-gray-600 leading-relaxed text-[15px] mb-4 group-hover:text-gray-900 transition-colors line-clamp-4">
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

        {/* Botón para ver más reseñas */}
        <div className="mt-16 text-center">
            <a 
                href={REVIEWS_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
            >
                Ver todas las reseñas en Google
            </a>
        </div>

      </div>
    </section>
  );
}
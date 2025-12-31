"use client"; 
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGoogle, FaStar } from 'react-icons/fa'; // Asegúrate de importar FaStar

type Review = {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
};

const REVIEWS_URL = "https://www.google.es/maps/place/Kiq+montajes/@36.7105247,-4.44564,17z/data=!4m8!3m7!1s0x2e97f2871d5c7bd5:0xefadad7a51055b7b!8m2!3d36.7105204!4d-4.4430651!9m1!1b1!16s%2Fg%2F11yfk3vrs6?hl=es&entry=ttu";
const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <FaStar key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`} />
    );
  }
  return <div className="flex items-center gap-1">{stars}</div>;
}

export default function Testimonios() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`${API_BASE_URL}/get-reviews?language=es`);
        if (!response.ok) throw new Error("Error API");
        const data = await response.json();
        if (data.error || !data.result?.reviews) throw new Error("No reviews");
        setReviews(data.result.reviews.slice(0, 3));
      } catch (err) { 
        console.error(err);
        setError("No pudimos cargar las reseñas.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (isLoading) return <div className="py-20 text-center text-gray-400 animate-pulse">Cargando opiniones reales...</div>;
  if (error) return null;
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 bg-white px-4 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        
        {/* --- CABECERA UNIFICADA (ESTILO IDENTICO A "COMO FUNCIONA") --- */}
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Lo que dicen <span className="text-blue-600">de nosotros</span>
          </h2>
          
          {/* Subtítulo con la valoración */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg text-gray-500">
             <div className="flex items-center gap-2">
                <span className="flex text-yellow-400"><FaGoogle size={20}/></span>
                <span>Valoración media de <strong>4.9/5</strong> en Google</span>
             </div>
             <span className="hidden md:block text-gray-300">|</span>
             <a href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline text-base">
                Leer todas las reseñas →
            </a>
          </div>
        </div>

        {/* GRID DE RESEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <a 
              href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" key={i}
              className="bg-gray-50 p-8 rounded-3xl hover:bg-blue-50 transition-colors duration-300 flex flex-col h-full group"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-center gap-4 mb-6">
                <Image 
                  src={review.profile_photo_url} 
                  alt={review.author_name} 
                  width={48} height={48} 
                  className="rounded-full bg-white shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{review.author_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400 font-medium">{review.relative_time_description}</span>
                  </div>
                </div>
              </div>
              
              {/* Texto de la reseña */}
              <p className="text-gray-600 leading-relaxed italic mb-4 flex-grow">
                "{review.text}"
              </p>
              
              {/* Icono Google footer */}
              <div className="pt-4 border-t border-gray-200/50 flex justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                 <FaGoogle className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
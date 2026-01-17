'use client'; 
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGoogle, FaStar } from 'react-icons/fa';

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
  return <div className="flex items-center gap-1" aria-hidden="true">{stars}</div>;
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

  if (isLoading) return <div className="py-24 text-center text-gray-400 animate-pulse font-light">Cargando opiniones verificadas...</div>;
  if (error) return null;
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
                <span className="font-medium text-gray-900"><strong>4.9/5</strong> en Google</span>
             </div>
             <span className="hidden md:block w-px h-6 bg-gray-200"></span>
             <a href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline decoration-2 underline-offset-4 text-base transition-colors">
                Leer todas las reseñas &rarr;
            </a>
          </div>
        </div>

        {/* GRID DE RESEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <a 
              href={REVIEWS_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              key={i}
              aria-label={`Reseña de ${review.author_name}`}
              className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100 group"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <Image 
                    src={review.profile_photo_url} 
                    alt="" 
                    width={56} height={56} 
                    className="rounded-full bg-gray-100 border-2 border-white shadow-sm object-cover"
                    aria-hidden="true"
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
                  <p className="text-gray-600 leading-relaxed text-[15px] mb-4 line-clamp-4 group-hover:text-gray-900 transition-colors">
                    "{review.text}"
                  </p>
              </div>
              
              {/* Footer tarjeta */}
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Verificado</span>
                 <span className="text-xs text-gray-400 group-hover:text-indigo-500 font-medium transition-colors">Ver en Maps &rarr;</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
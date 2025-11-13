// En: src/app/components/Testimonios.tsx

"use client"; // <-- ¡Paso 1! Es interactivo (necesita fetch de datos)

import { useState, useEffect } from 'react';

// --- Definimos la "forma" (type) de una Reseña ---
type Review = {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
};

// --- El enlace para "Ver más reseñas" (de tu traductor.js) ---
const REVIEWS_URL = "https://www.google.es/maps/place/Kiq+montajes/@36.7105247,-4.44564,17z/data=!4m8!3m7!1s0x2e97f2871d5c7bd5:0xefadad7a51055b7b!8m2!3d36.7105204!4d-4.4430651!9m1!1b1!16s%2Fg%2F11yfk3vrs6?hl=es&entry=ttu";

// --- La URL de tu API (de tu traductor.js) ---
const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

// --- Un pequeño componente para renderizar las estrellas ---
function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <svg 
        key={i} 
        className={`w-5 h-5 ${i < rating ? 'text-acento' : 'text-gray-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
      </svg>
    );
  }
  return <div className="flex items-center">{stars}</div>;
}


export default function Testimonios() {
  // --- "Memoria" (Estado) para las reseñas, carga y errores ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ¡Paso 2! "Traducción" de tu fetchGoogleReviews() ---
  // Esto se ejecuta 1 vez cuando el componente carga
  useEffect(() => {
    async function fetchReviews() {
      try {
        // Llamamos a tu API de Render
        const response = await fetch(`${API_BASE_URL}/get-reviews?language=es`);
        if (!response.ok) {
          throw new Error("Error al conectar con la API de reseñas");
        }

        const data = await response.json();

        if (data.error || !data.result || !data.result.reviews || data.result.reviews.length === 0) {
          throw new Error("No se encontraron reseñas");
        }

        // Guardamos las 3 primeras reseñas en nuestro "estado"
        setReviews(data.result.reviews.slice(0, 3));

      } catch (err: any) {
        console.error('Error al cargar las reseñas:', err);
        setError("No se pudieron cargar las reseñas en este momento.");
      } finally {
        setIsLoading(false); // Terminamos de cargar
      }
    }

    fetchReviews();
  }, []); // El array vacío [] asegura que solo se ejecute 1 vez


  // --- ¡Paso 3! Renderizado condicional ---

  const renderContent = () => {
    // --- Caso 1: Cargando ---
    if (isLoading) {
      return <p className="text-center text-texto-secundario italic">Cargando reseñas...</p>;
    }

    // --- Caso 2: Error ---
    if (error) {
      return <p className="text-center text-red-500 italic">{error}</p>;
    }

    // --- Caso 3: No hay reseñas ---
    if (reviews.length === 0) {
      return <p className="text-center text-texto-secundario italic">Actualmente no hay reseñas para mostrar.</p>;
    }

    // --- Caso 4: ¡Éxito! Mostramos las reseñas ---
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <a 
            href={REVIEWS_URL} // Enlace a Google Maps
            target="_blank" 
            rel="noopener noreferrer" 
            key={review.author_name} 
            className="flex flex-col rounded-lg bg-superficie p-6 shadow-xl transition-transform duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center mb-4">
              <img 
                src={review.profile_photo_url} 
                alt={review.author_name} 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div className="ml-4">
                <h3 className="font-bold text-primario-oscuro uppercase">{review.author_name}</h3>
                <StarRating rating={review.rating} />
              </div>
            </div>
            <p className="text-texto-secundario italic text-base">
              "{review.text}"
            </p>
          </a>
        ))}
      </div>
    );
  };

  return (
    <section id="testimonios" className="bg-fondo py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-4xl font-titulo font-bold text-primario-oscuro mb-4">
          Qué dicen nuestros clientes
        </h2>
        <div className="w-20 h-1 bg-acento mx-auto mb-12"></div>

        {/* Aquí renderizamos el contenido (Carga, Error, o Reseñas) */}
        {renderContent()}

        {/* Botón de "Ver más" (solo si no hay error) */}
        {!isLoading && !error && (
          <div className="text-center mt-12">
            <a 
              href={REVIEWS_URL}
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block rounded-md bg-primario-oscuro px-8 py-3 font-bold text-superficie transition-opacity hover:opacity-90"
            >
              Ver más reseñas en Google
            </a>
          </div>
        )}

      </div>
    </section>
  );
}
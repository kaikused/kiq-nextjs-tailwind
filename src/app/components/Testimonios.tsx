'use client'; 
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGoogle, FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

type Review = {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
  google_maps_uri: string;
};

export default function Testimonios() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);

  // Enlace directo a la sección de reseñas de tu ficha
  const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/Kiq+montajes/@36.721272,-4.44422,17z/data=!4m8!3m7!1s0xd727c871d5c7b55:0xefadec7a51055bdb!8m2!3d36.721272!4d-4.44422!9m1!1b1!16s%2Fg%2F11y5p817m8?entry=ttu";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-reviews`);
        const data = await res.json();
        if (data.result?.reviews) {
          // Solo mostramos las 3 más destacadas para mantener la web ligera
          setReviews(data.result.reviews.slice(0, 3));
          setRating(data.result.rating_global);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="testimonios">
      {/* SEO: Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "AggregateRating",
        "itemReviewed": { "@type": "LocalBusiness", "name": "Kiq Montajes Málaga" },
        "ratingValue": rating,
        "reviewCount": "7",
        "bestRating": "5"
      })}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Opiniones de Clientes
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1]">
              Lo que dicen de <span className="text-indigo-600 font-black">nosotros</span>
            </h2>
          </motion.div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-6 mx-auto md:mx-0 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900">{rating}</div>
              <div className="flex text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <FaGoogle className="text-[#4285F4]" /> Google Maps
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 font-bold">Reseñas Verificadas</p>
            </div>
          </div>
        </div>

        {/* Grid Estático: 3 Reseñas Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reviews.map((r, i) => (
            <motion.a
              key={r.author_name + i}
              href={r.google_maps_uri}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group flex flex-col justify-between p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.12)] transition-all"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <Image src={r.profile_photo_url} alt={r.author_name} width={56} height={56} className="rounded-2xl object-cover ring-4 ring-white shadow-sm" unoptimized />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1 shadow-md">
                      <FaGoogle className="text-[#4285F4] text-[10px]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm leading-tight">{r.author_name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{r.relative_time_description}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-[15px] italic line-clamp-4 group-hover:text-gray-900 transition-colors">
                  "{r.text}"
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50 text-yellow-400">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => <FaStar key={idx} size={14} />)}
                </div>
                <FaExternalLinkAlt className="text-gray-200 group-hover:text-indigo-400 transition-colors w-3 h-3" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Botonera Simplificada: Solo Navegación Directa */}
        <div className="flex flex-col items-center gap-6">
          <a 
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-12 py-5 bg-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 active:scale-95"
          >
            Ver más experiencias <FaExternalLinkAlt className="group-hover:translate-x-1 transition-transform" />
          </a>

          <a 
            href="https://search.google.com/local/writereview?placeid=ChIJ1XtcHYfyly4Re1sFUXqtre8"
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 font-bold hover:text-indigo-600 transition-colors underline underline-offset-8 decoration-gray-200 hover:decoration-indigo-200 text-sm"
          >
            ¿Has trabajado con nosotros? Deja tu reseña aquí
          </a>
        </div>
      </div>
    </section>
  );
}
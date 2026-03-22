'use client'; 
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaGoogle, FaStar, FaExternalLinkAlt, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

type Review = {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
};

export default function Testimonios() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  // Reemplaza con el enlace real a tu ficha de Google
  const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/Kiq+montajes/@36.7118116,-4.4518774,17z/data=!4m8!3m7!1s0x1203b71f1d977715:0xebadeb6451056b7b!8m2!3d36.7118116!4d-4.4518774!9m1!1b1!16s%2Fg%2F11vsw0q0m_?entry=ttu";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-reviews`);
        const data = await res.json();
        if (data.result?.reviews) {
          setReviews(data.result.reviews);
          setRating(data.result.rating_global);
        }
      } catch (err) {
        console.error("Fallo de conexión:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="testimonios">
      {/* SEO: Schema Markup para aparecer con estrellas en Google Search */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "AggregateRating",
        "itemReviewed": {
          "@type": "LocalBusiness",
          "name": "Kiq Montajes Málaga",
          "image": "https://kiq.es/logo.png",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Camino San Rafael 17",
            "addressLocality": "Málaga",
            "addressRegion": "Andalucía",
            "postalCode": "29006",
            "addressCountry": "ES"
          }
        },
        "ratingValue": rating,
        "reviewCount": "7", // Ponemos 7 porque es el valor real de tu negocio
        "bestRating": "5"
      })}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Experiencias Reales
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1]">
              Lo que nuestros clientes <span className="text-indigo-600">opinan</span>
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center gap-6"
          >
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900">{rating}</div>
              <div className="flex text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => <FaStar key={i} />)}
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <FaGoogle className="text-[#4285F4]" /> Perfil de Empresa
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Verificado por Google</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {reviews.slice(0, visibleCount).map((r, i) => (
              <motion.a
                key={i}
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
                className="group flex flex-col justify-between p-8 bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-shrink-0">
                      {r.profile_photo_url ? (
                        <Image src={r.profile_photo_url} alt={r.author_name} width={56} height={56} className="rounded-2xl object-cover ring-4 ring-white shadow-sm" unoptimized />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">{r.author_name.charAt(0)}</div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1 shadow-md">
                        <FaGoogle className="text-[#4285F4] text-[10px]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{r.author_name}</h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{r.relative_time_description}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[15px] mb-8 line-clamp-4 group-hover:text-gray-900 transition-colors">
                    "{r.text}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, idx) => <FaStar key={idx} className="w-3.5 h-3.5" />)}
                  </div>
                  <FaExternalLinkAlt className="text-gray-300 group-hover:text-indigo-400 transition-colors w-3 h-3" />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
          {visibleCount < reviews.length ? (
            <button 
              onClick={() => setVisibleCount(prev => prev + 3)}
              className="group flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200"
            >
              Cargar más <FaChevronDown className="group-hover:translate-y-1 transition-transform" />
            </button>
          ) : (
            <a 
              href={GOOGLE_MAPS_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-10 py-5 bg-white text-gray-900 border-2 border-gray-900 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-md"
            >
              Ver todas en Maps <FaExternalLinkAlt />
            </a>
          )}
          
          <a 
            href="https://search.google.com/local/writereview?placeid=ChIJ1XtcHYfyly4Re1sFUXqtre8"
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 font-bold hover:text-indigo-600 transition-colors underline underline-offset-8 decoration-gray-200 hover:decoration-indigo-200"
          >
            Deja tu propia reseña
          </a>
        </div>
      </div>
    </section>
  );
}
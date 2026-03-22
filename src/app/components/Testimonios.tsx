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

export default function Testimonios() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);

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
        console.error("Error al conectar con el backend:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || reviews.length === 0) return null;

  return (
    <section className="py-24 bg-white px-4 border-t border-gray-100" id="testimonios">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Opiniones Reales</h2>
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <FaGoogle className="text-gray-400 mr-2" />
            <span className="text-gray-900 font-bold">{rating}/5</span>
            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                {r.profile_photo_url && (
                  <Image src={r.profile_photo_url} alt={r.author_name} width={48} height={48} className="rounded-full" unoptimized />
                )}
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{r.author_name}</h3>
                  <p className="text-xs text-gray-400">{r.relative_time_description}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'use client';

import Image from 'next/image';
import { FaMapMarkerAlt, FaUserCircle, FaCamera, FaArrowRight } from "react-icons/fa";

interface ProductCardProps {
  title: string;
  price: number;
  image: string | null;
  location: string;
  sellerName: string;
  sellerAvatar?: string;
  date: string;
  onContact: () => void;
}

export default function ProductCard({
  title, price, image, location, sellerName, sellerAvatar, date, onContact
}: ProductCardProps) {
  
  const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <button 
      type="button" 
      onClick={onContact}
      aria-label={`Ver detalles de ${title}, precio ${formatPrice(price)}`}
      className="group w-full h-full text-left bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col focus:outline-none focus:ring-4 focus:ring-indigo-100"
    >
      {/* 1. FOTO (Aspecto 4:3) */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            <FaCamera size={32} aria-hidden="true" />
          </div>
        )}
        
        {/* Badge de Precio (Glassmorphism) */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 font-bold px-3 py-1.5 rounded-full shadow-sm text-sm z-10 border border-white/50">
          {formatPrice(price)}
        </div>

        {/* Overlay gradiente sutil abajo para que resalte el contenido si fuera necesario */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 2. DETALLES */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Título y Fecha */}
        <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-[15px] line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
            {title}
            </h3>
        </div>
        
        {/* Ubicación y Fecha */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
          <FaMapMarkerAlt className="text-indigo-500" aria-hidden="true" />
          <span className="truncate max-w-[120px]">{location}</span>
          <span className="mx-1 text-gray-300" aria-hidden="true">|</span>
          <span>{new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* 3. FOOTER (Vendedor + CTA) */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
          
          {/* Vendedor */}
          <div className="flex items-center gap-2 min-w-0">
             <div className="relative w-7 h-7 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {sellerAvatar ? (
                    <Image src={sellerAvatar} alt="" fill className="object-cover" sizes="28px" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUserCircle /></div>
                )}
             </div>
             <span className="text-xs font-medium text-gray-600 truncate">{sellerName}</span>
          </div>
          
          {/* Botón CTA Falso */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]">
            <FaArrowRight size={12} />
          </div>
        </div>
      </div>
    </button>
  );
}
import Image from 'next/image';
import { FaMapMarkerAlt, FaUserCircle, FaCamera } from "react-icons/fa";

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
  
  const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <button 
      type="button" // Convertimos el div en button para accesibilidad total (Keyboard navigable)
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full focus:outline-none focus:ring-4 focus:ring-indigo-100"
      onClick={onContact}
      aria-label={`Ver detalles de ${title}, precio ${formatPrice(price)}`}
    >
      {/* 1. FOTO (Aspecto 4:3) - OPTIMIZADO CON NEXT/IMAGE */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {image ? (
          <Image 
            src={image} 
            alt={title} 
            fill // Ocupa todo el contenedor padre
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            // IMPORTANTE: 'sizes' ayuda al navegador a descargar la versión pequeña en móvil
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FaCamera size={30} aria-hidden="true" />
          </div>
        )}
        
        {/* Badge de Precio Flotante */}
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-gray-900 font-black px-3 py-1 rounded-lg shadow-sm text-sm z-10">
          {formatPrice(price)}
        </div>
      </div>

      {/* 2. DETALLES */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 leading-snug">
          {title}
        </h3>
        
        {/* CORRECCIÓN: text-gray-400 -> text-gray-500 (Contraste) */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <FaMapMarkerAlt className="text-indigo-500" aria-hidden="true" />
          <span className="truncate max-w-[100px]">{location}</span>
          <span className="mx-1" aria-hidden="true">•</span>
          <span>{new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
        </div>

        {/* 3. VENDEDOR (Footer de la tarjeta) */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
          {sellerAvatar ? (
             <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                <Image 
                    src={sellerAvatar} 
                    alt="" // Decorativo porque el nombre ya está al lado
                    fill
                    className="object-cover"
                    sizes="24px"
                />
             </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
               <FaUserCircle size={14} aria-hidden="true"/>
            </div>
          )}
          
          {/* CORRECCIÓN: text-gray-600 -> text-gray-700 */}
          <span className="text-xs font-medium text-gray-700 truncate">{sellerName}</span>
          
          {/* FALSO BOTÓN (Visualmente es botón, pero semánticamente es span para no romper el button padre) */}
          <span className="ml-auto text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            LO QUIERO
          </span>
        </div>
      </div>
    </button>
  );
}
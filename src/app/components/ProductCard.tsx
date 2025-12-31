import { FaMapMarkerAlt, FaTag, FaUserCircle, FaCamera } from "react-icons/fa";

interface ProductCardProps {
  title: string;
  price: number;
  image: string | null;
  location: string;
  sellerName: string;
  sellerAvatar?: string;
  date: string;
  onContact: () => void; // Acción al pulsar (Comprar/Chat)
}

export default function ProductCard({
  title, price, image, location, sellerName, sellerAvatar, date, onContact
}: ProductCardProps) {
  
  const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full"
      onClick={onContact}
    >
      {/* 1. FOTO (Aspecto 4:3 para que se vean bien los muebles) */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FaCamera size={30} />
          </div>
        )}
        
        {/* Badge de Precio Flotante */}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 font-black px-3 py-1 rounded-lg shadow-sm text-sm">
          {formatPrice(price)}
        </div>
      </div>

      {/* 2. DETALLES */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 leading-snug">
          {title}
        </h3>
        
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <FaMapMarkerAlt className="text-indigo-400" />
          <span className="truncate">{location}</span>
          <span className="mx-1">•</span>
          <span>{new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
        </div>

        {/* 3. VENDEDOR (Footer de la tarjeta) */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2">
          {sellerAvatar ? (
            <img src={sellerAvatar} alt={sellerName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
               <FaUserCircle size={14}/>
            </div>
          )}
          <span className="text-xs font-medium text-gray-600 truncate">{sellerName}</span>
          
          <button className="ml-auto text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            LO QUIERO
          </button>
        </div>
      </div>
    </div>
  );
}
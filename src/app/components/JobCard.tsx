import { FaCalendarAlt, FaMapMarkerAlt, FaImage, FaCommentDots, FaWhatsapp } from "react-icons/fa";

interface JobCardProps {
  title: string;
  price: number;
  date: string;
  location: string;
  imageUrl?: string;
  
  // 🔥 NUEVO: El dato que viene del backend (puede ser null o string)
  clientPhone?: string; 

  // Datos de Estado
  statusLabel: string;
  statusColorClass: string; 

  // Slots
  children?: React.ReactNode; 
  onImageClick?: () => void;

  // Acción para abrir el chat (Opcional)
  onChatClick?: () => void;
}

export default function JobCard({ 
  title, price, date, location, imageUrl, clientPhone, statusLabel, statusColorClass, children, onImageClick, onChatClick 
}: JobCardProps) {
  
  const format = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group relative flex flex-col">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-4">
        
        {/* Bloque Izquierdo: Imagen + Textos */}
        <div className="flex gap-4 flex-1 min-w-0">
          
          {/* Imagen */}
          <div 
            className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative cursor-pointer"
            onClick={onImageClick}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FaImage />
              </div>
            )}
          </div>

          {/* Columna de Textos */}
          <div className="flex flex-col gap-1 min-w-0 pr-2">
            
            {/* Badge */}
            <div className="flex">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColorClass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                {statusLabel}
                </div>
            </div>
            
            {/* Título */}
            <h3 className="font-bold text-gray-900 leading-tight truncate text-base">
              {title}
            </h3>
            
            {/* Metadatos */}
            <div className="flex flex-col gap-0.5">
                <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    <FaCalendarAlt size={10} className="flex-shrink-0" /> 
                    <span className="truncate">{date}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-red-400 flex-shrink-0" size={11} /> 
                    <span className="truncate">{location}</span>
                </p>
            </div>
          </div>
        </div>

        {/* Bloque Derecho: Precio */}
        <div className="text-right flex-shrink-0 pl-2">
          <span className="block text-xl font-black text-gray-900 tracking-tight leading-none">
            {format(price)}
          </span>
        </div>
      </div>

      {/* 🔮 VENTANA MÁGICA: DATOS DE CONTACTO 
          Solo se muestra si el backend envió el teléfono (clientPhone existe)
      */}
      {clientPhone && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white p-2 rounded-full shadow-sm">
                    <FaWhatsapp size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider">Contacto Directo</p>
                    <p className="text-sm font-black text-gray-800 tracking-tight">{clientPhone}</p>
                </div>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    // Limpiamos espacios para el enlace
                    const cleanPhone = clientPhone.replace(/\D/g, '');
                    window.open(`https://wa.me/${cleanPhone}`, '_blank');
                }}
                className="px-3 py-1.5 bg-white text-green-700 text-xs font-bold rounded-lg border border-green-100 shadow-sm hover:bg-green-50 transition-colors"
            >
                Abrir
            </button>
        </div>
      )}

      {/* --- ÁREA DE CONTENIDO (Botones del padre, Desglose, etc.) --- */}
      <div className="flex-grow">
        {children}
      </div>

      {/* --- FOOTER: BOTÓN CHAT DESTACADO --- */}
      {onChatClick && (
        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
            <button 
                onClick={(e) => {
                    e.stopPropagation(); 
                    onChatClick();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
            >
                <FaCommentDots size={16} />
                Abrir Chat de Trabajo
            </button>
        </div>
      )}

    </div>
  );
}
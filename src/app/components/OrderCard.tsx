import { FaBox, FaCheckCircle, FaClock, FaTruck, FaComments } from 'react-icons/fa';

interface OrderCardProps {
  orderId: number;
  date: string;
  total: number;
  status: string; // 'pendiente_pago', 'pagado', 'entregado'
  productTitle: string;
  productImage?: string;
  onContactSeller?: () => void;
  onViewDetails?: () => void;
}

export default function OrderCard({
  orderId, date, total, status, productTitle, productImage, onContactSeller, onViewDetails
}: OrderCardProps) {
  
  const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  // Configuración visual según estado
  const getStatusConfig = (s: string) => {
      switch(s) {
          case 'pagado': return { icon: <FaCheckCircle/>, text: 'Pagado', color: 'text-green-600 bg-green-50 border-green-200' };
          case 'entregado': return { icon: <FaBox/>, text: 'Entregado', color: 'text-gray-600 bg-gray-100 border-gray-200' };
          case 'pendiente_pago': return { icon: <FaClock/>, text: 'Pendiente', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
          default: return { icon: <FaTruck/>, text: s, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 flex gap-4">
        
        {/* Imagen del Producto */}
        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
            {productImage ? (
                <img src={productImage} alt={productTitle} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FaBox size={24} />
                </div>
            )}
        </div>

        {/* Info Principal */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-gray-400 mb-0.5">Pedido #{orderId} • {new Date(date).toLocaleDateString()}</p>
                    <h3 className="font-bold text-gray-900 truncate pr-2">{productTitle}</h3>
                </div>
                <span className="font-black text-lg text-gray-900">{formatPrice(total)}</span>
            </div>

            <div className="flex justify-between items-end mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${statusConfig.color}`}>
                    {statusConfig.icon} {statusConfig.text}
                </span>
                
                <div className="flex gap-2">
                    {onContactSeller && (
                        <button 
                            onClick={onContactSeller}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
                        >
                            <FaComments /> Chat Vendedor
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer de Upsell (El Puente) */}
      {status === 'pagado' && (
          <div className="bg-gradient-to-r from-indigo-50 to-white p-3 border-t border-indigo-100 flex items-center justify-between">
              <p className="text-xs text-indigo-800 font-medium">¿Necesitas ayuda con el transporte o montaje?</p>
              <button className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition">
                  Contratar Montador
              </button>
          </div>
      )}
    </div>
  );
}
import { FaBox, FaCheckCircle, FaClock, FaUser, FaComments, FaMoneyBillWave } from 'react-icons/fa';

interface SaleCardProps {
  orderId: number;
  date: string;
  total: number;
  status: string; // 'pendiente_pago', 'pagado', 'entregado'
  metodoPago: string;
  productTitle: string;
  productImage?: string;
  buyerName: string;
  onContactBuyer: () => void;
}

export default function SaleCard({
  orderId, date, total, status, metodoPago, productTitle, productImage, buyerName, onContactBuyer
}: SaleCardProps) {
  
  const formatPrice = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  // Configuración visual según estado
  const getStatusConfig = (s: string) => {
      switch(s) {
          case 'pagado': return { icon: <FaCheckCircle/>, text: 'Cobrado (Stripe)', color: 'text-green-700 bg-green-50 border-green-200' };
          case 'entregado': return { icon: <FaBox/>, text: 'Entregado', color: 'text-gray-600 bg-gray-100 border-gray-200' };
          case 'pendiente_pago': return { icon: <FaClock/>, text: 'Cobro Pendiente (Efectivo)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
          default: return { icon: <FaBox/>, text: s, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 flex gap-4">
        
        {/* Imagen del Producto */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
            {productImage ? (
                <img src={productImage} alt={productTitle} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FaBox size={20} />
                </div>
            )}
        </div>

        {/* Info Principal */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{productTitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <FaUser size={10}/> Comprador: <span className="font-medium text-gray-600">{buyerName}</span>
                    </p>
                </div>
                <div className="text-right">
                    <span className="block font-black text-lg text-gray-900 leading-none">{formatPrice(total)}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{metodoPago}</span>
                </div>
            </div>

            <div className="flex justify-between items-end mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusConfig.color}`}>
                    {statusConfig.icon} {statusConfig.text}
                </span>
                
                <button 
                    onClick={onContactBuyer}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
                >
                    <FaComments /> Chat
                </button>
            </div>
        </div>
      </div>
      
      {/* Footer Informativo */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[10px] text-gray-400">Pedido #{orderId} • {new Date(date).toLocaleDateString()}</p>
          {status === 'pagado' && (
              <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                  <FaMoneyBillWave /> Fondos retenidos en Kiq
              </p>
          )}
      </div>
    </div>
  );
}
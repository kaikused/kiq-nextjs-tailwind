'use client';
import { FaCreditCard, FaMoneyBillWave, FaTimes, FaCheckCircle, FaGem } from 'react-icons/fa';

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStripe: () => void;
  onSelectGems: () => void;
  onConseguirGemas: () => void; 
  precio: number;
  saldoGemas: number;
  costeGemas: number;       // Lo ignoramos visualmente para el cliente
  esPrimerTrabajo: boolean; // Lo ignoramos visualmente para el cliente
}

export default function PaymentSelectionModal({
  isOpen,
  onClose,
  onSelectStripe,
  onSelectGems,
  // onConseguirGemas, -> Ya no lo necesitamos aquí porque el cliente no se bloquea
  precio,
  saldoGemas,
}: PaymentSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Elige cómo pagar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <p className="text-center text-gray-500 mb-8">
            El precio total del servicio es de <span className="font-bold text-gray-900">{precio}€</span>.
            <br/>Selecciona tu método preferido para finalizar la reserva.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* --- OPCIÓN 1: STRIPE (Pago Seguro) --- */}
            <div 
              onClick={onSelectStripe}
              className="border-2 border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition group relative flex flex-col"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <FaCreditCard size={24} />
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">Pago Online Seguro</h4>
              <p className="text-sm text-gray-500 mb-4 flex-grow">
                Paga ahora con tarjeta. Kiq retiene el dinero y no paga al montador hasta que tú confirmes que el trabajo está hecho.
              </p>
              <div className="mt-auto">
                <div className="bg-gray-100 rounded-lg p-2 text-center text-xs font-medium text-gray-600">
                    Sin comisiones extra
                </div>
              </div>
            </div>

            {/* --- OPCIÓN 2: EFECTIVO (Ahora siempre disponible) --- */}
            <div 
              onClick={onSelectGems}
              className="border-2 border-green-200 bg-green-50/30 rounded-xl p-6 cursor-pointer hover:border-green-500 hover:bg-green-50 transition group relative flex flex-col"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                <FaMoneyBillWave size={24} />
              </div>
              
              <h4 className="font-bold text-lg text-gray-900 mb-2">Pago en Efectivo</h4>
              <p className="text-sm text-gray-500 mb-4 flex-grow">
                Reservas ahora y pagas directamente al montador en mano cuando termine el trabajo.
              </p>
              
              <div className="mt-auto">
                {/* Caja de Precio para Cliente: SIEMPRE GRATIS LA RESERVA */}
                <div className="bg-white border border-green-200 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">Coste reserva:</span>
                    <span className="font-black text-green-600 flex items-center gap-1 text-lg">
                        GRATIS <FaCheckCircle size={16}/>
                    </span>
                </div>

                {/* Info sutil de puntos */}
                <p className="text-[10px] text-center text-gray-400 mt-2 font-medium flex justify-center items-center gap-1">
                    <FaGem className="text-blue-400"/> Tienes {saldoGemas} puntos Kiq acumulados
                </p>
              </div>
            </div>

          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
                Al continuar aceptas las condiciones del servicio.
            </p>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
// Asegúrate de que esta ruta apunte a tu hook.
// Si tu estructura es src/app/hooks, la ruta podría ser '../../../app/hooks/usePaymentGuard'
// O si es src/hooks, sería '../../../hooks/usePaymentGuard'
import { PaymentMethod } from '../../hooks/usePaymentGuard'; 

const Icons = {
  Cash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><rect width="20" height="12" x="2" y="7" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M12 21v-2"/><path d="M12 5V3"/><path d="M12 21h0"/><path d="M22 13h-2"/><path d="M4 13H2"/></svg>
  ),
  Card: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  Bank: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M10 9L14 9"/><path d="M12 17v-4"/><path d="m2 9 10-6 10 6v2H2V9Z"/></svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  )
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const methods: PaymentMethod[] = [
    { id: 'cash', label: 'Efectivo', icon: Icons.Cash, desc: 'Pago contra entrega' },
    { id: 'card', label: 'Tarjeta', icon: Icons.Card, desc: 'Procesado seguro' },
    { id: 'transfer', label: 'Transferencia', icon: Icons.Bank, desc: 'Validación manual' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-all animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Selecciona Método</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Icons.Close />
          </button>
        </div>
        
        <div className="space-y-3">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => onSelect(method)}
                className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group active:scale-[0.98]"
              >
                <div className="mr-4 p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                  <Icon />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-800">{method.label}</div>
                  <div className="text-xs text-gray-500">{method.desc}</div>
                </div>
                <div className="ml-auto w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-colors" />
              </button>
            )
          })}
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 leading-relaxed">
          <p>La selección es preliminar. No se realizará ningún cargo hasta que acuerdes los detalles con el vendedor.</p>
        </div>
      </div>
    </div>
  );
};

// 👇 ESTO FALTABA: La exportación por defecto
export default PaymentMethodModal;
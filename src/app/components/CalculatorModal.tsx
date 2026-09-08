'use client';
import { useUI } from '../context/UIContext'; 
import { FaTimes } from 'react-icons/fa'; 
import ChatCalculadora from './ChatCalculadora'; 

export default function CalculatorModal() {
  const { isCalculatorModalOpen, closeModals, calculatorMode, userProfile } = useUI();

  if (!isCalculatorModalOpen) {
    return null;
  }

  return (
    <div 
      // 🚀 CAMBIO CLAVE: z-[10000] asegura que flote ENCIMA de todo (header, chat fullscreen, etc.)
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div 
        // Estructura Flex Column para que el chat ocupe el espacio correcto sin desbordar
            className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-slate-200/80"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* --- Cabecera del Modal (Limpia y separada) --- */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 shrink-0 bg-white z-10">
            <h3 className="font-titulo font-bold text-lg text-slate-900">
                Pedir precio
            </h3>
            <button 
                onClick={closeModals}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800 focus:outline-none"
                aria-label="Cerrar cotizador"
            >
                <FaTimes size={16} />
            </button>
        </div>

        <div className="flex-grow overflow-hidden relative bg-slate-50">
            <ChatCalculadora 
                onPublishSuccess={closeModals} 
                mode={calculatorMode || 'lite'} 
                initialUserName={userProfile?.nombre}
            />
        </div>
        
      </div>
    </div>
  );
}
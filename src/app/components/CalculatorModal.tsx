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
        className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* --- Cabecera del Modal (Limpia y separada) --- */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0 bg-white z-10">
            <h3 className="font-bold text-lg text-gray-800">
                Asistente de Presupuestos IA
            </h3>
            <button 
                onClick={closeModals}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500 focus:outline-none"
                aria-label="Cerrar calculadora"
            >
                <FaTimes size={18} />
            </button>
        </div>

        {/* --- Cuerpo del Chat --- */}
        <div className="flex-grow overflow-hidden relative bg-gray-50">
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
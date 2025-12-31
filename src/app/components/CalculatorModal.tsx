'use client';
import { useUI } from '../context/UIContext'; 
import { FaTimes } from 'react-icons/fa'; 
import ChatCalculadora from './ChatCalculadora'; 

export default function CalculatorModal() {
  // 1. Traemos 'userProfile' para identificar al usuario si está logueado
  const { isCalculatorModalOpen, closeModals, calculatorMode, userProfile } = useUI();

  if (!isCalculatorModalOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      // Nota: El onClick para cerrar fuera se quitó intencionalmente para evitar cierres accidentales
    >
      <div 
        className="relative w-full max-w-3xl p-0 bg-white rounded-lg shadow-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={closeModals}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition-all"
        >
          <FaTimes size={20} />
        </button>

        {/* 2. Pasamos el Modo y los Datos del Usuario al Chat */}
        <ChatCalculadora 
            onPublishSuccess={closeModals} 
            mode={calculatorMode || 'lite'} 
            // Inyectamos el nombre para que el chat salude y salte la intro
            // (Asegúrate de que ChatCalculadora acepte esta prop 'initialUserName')
            initialUserName={userProfile?.nombre}
        />
        
      </div>
    </div>
  );
}
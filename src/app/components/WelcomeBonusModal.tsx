'use client';
import { FaGift, FaCheckCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeBonusModal({ isOpen, onClose }: WelcomeBonusModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para la animación de entrada suave
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Fondo oscuro (Sin onClick para obligar a usar el botón) */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden text-center p-8 transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Icono Flotante Animado */}
        <div className="mx-auto w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
            <FaGift size={36} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
            ¡Bienvenido al equipo!
        </h2>
        
        <p className="text-gray-500 text-sm mb-6 px-2">
            Para que empieces con buen pie, hemos cargado un regalo de bienvenida en tu cuenta.
        </p>
            
        <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl flex flex-col gap-3 mb-8 text-left">
            <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-full text-green-500 shadow-sm">
                    <FaCheckCircle size={14} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">500 Gemas de Saldo</p>
                    <p className="text-xs text-gray-500">Para aceptar tus primeros trabajos.</p>
                </div>
            </div>
            <div className="h-px bg-yellow-200/50 w-full"></div>
            <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-full text-green-500 shadow-sm">
                    <FaCheckCircle size={14} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">Comisión 0% (Gratis)</p>
                    <p className="text-xs text-gray-500">Tu primer trabajo en efectivo es para ti.</p>
                </div>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-transform active:scale-95"
        >
            ¡Entendido, gracias!
        </button>

      </div>
    </div>
  );
}
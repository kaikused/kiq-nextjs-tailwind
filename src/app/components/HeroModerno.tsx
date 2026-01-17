'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp, FaMagic } from 'react-icons/fa';

interface HeroModernoProps {
  onStartCotizacion: (texto: string) => void;
}

export default function HeroModerno({ onStartCotizacion }: HeroModernoProps) {
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  
  useEffect(() => {
    const frases = ["un armario de IKEA Pax...", "un soporte de TV...", "unas cortinas...", "una cama canapé..."];
    let fraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;
    
    const typeEffect = () => {
      const currentFrase = frases[fraseIndex];
      
      if (isDeleting) {
        setPlaceholder(currentFrase.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setPlaceholder(currentFrase.substring(0, charIndex + 1));
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentFrase.length) {
        isDeleting = true;
        typeSpeed = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        fraseIndex = (fraseIndex + 1) % frases.length;
        typeSpeed = 500;
      }

      timeoutId = setTimeout(typeEffect, typeSpeed);
    };

    timeoutId = setTimeout(typeEffect, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleStart = () => {
    if (!inputValue.trim()) return;
    onStartCotizacion(inputValue); 
  };

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-white overflow-hidden px-4">
      
      {/* Fondo optimizado: Oculto en móvil */}
      <div className="hidden md:block absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

      {/* 🔥 CORRECCIÓN CRÍTICA DE LCP 🔥
         He quitado: "animate-in fade-in zoom-in duration-700"
         Ahora el texto aparece INSTANTÁNEAMENTE. Esto eliminará los 2.3s de retraso.
      */}
      <div className="z-10 w-full max-w-3xl text-center space-y-8">
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
          <span className="text-blue-600 md:text-transparent md:bg-clip-text md:bg-gradient-to-r md:from-blue-600 md:to-violet-600">
            Kiq Montajes
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
          Tu experto en montajes, potenciado por IA.
        </p>

        {/* INPUT TIPO GEMINI */}
        <div className="relative w-full group max-w-2xl mx-auto mt-8">
          {/* Fondo borroso oculto en móvil */}
          <div className="hidden md:block absolute -inset-1 bg-gradient-to-r from-blue-400 to-violet-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          
          <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-xl p-2 transition-all focus-within:shadow-2xl focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
            
            <div className="pl-4 pr-3 text-violet-500 animate-pulse">
              <FaMagic size={22} />
            </div>

            <input
              type="text"
              name="descripcion_trabajo"
              aria-label="Describe qué necesitas montar"
              className="w-full p-4 text-lg md:text-xl text-gray-800 outline-none placeholder-gray-400 bg-transparent"
              placeholder={`Necesito montar ${placeholder}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />

            <button 
              onClick={handleStart}
              disabled={!inputValue.trim()}
              aria-label="Comenzar cotización automática"
              className={`p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim().length > 0 
                  ? 'bg-blue-600 text-white shadow-lg hover:scale-105 hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaArrowUp size={20} />
            </button>
          </div>
        </div>

        {/* Etiquetas rápidas */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 opacity-80">
            <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">📸 Sube fotos</span>
            <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">⚡ Precio inmediato</span>
            <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">🔒 Pago seguro</span>
        </div>

      </div>
    </section>
  );
}
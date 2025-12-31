'use client';

import { useState } from 'react';

// Componentes existentes
import HeroModerno from './components/HeroModerno'; 
import ChatCalculadora from './components/ChatCalculadora';
import CalculatorModal from './components/CalculatorModal'; 
import SocialProof from './components/SocialProof';
import ComoFunciona from './components/ComoFunciona';
import Testimonios from './components/Testimonios'; 
import FooterMinimal from './components/FooterMinimal';

// 👇 Nuevo Componente Modular (Mucho más limpio)
import KiqOutletSection from './components/KiqOutletSection';

export default function Home() {
  const [cotizacionActiva, setCotizacionActiva] = useState(false);
  const [promptInicial, setPromptInicial] = useState('');

  const handleStartCotizacion = (texto: string) => {
    setPromptInicial(texto);
    setCotizacionActiva(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVolver = () => {
    setCotizacionActiva(false);
    setPromptInicial('');
  };

  return (
    <main className="min-h-screen bg-white selection:bg-blue-100">
      
      <CalculatorModal />

      {!cotizacionActiva ? (
        /* VISTA A: LA HOME */
        <div className="animate-in fade-in duration-500 flex flex-col min-h-screen">
          
          <div className="flex-grow">
            <HeroModerno onStartCotizacion={handleStartCotizacion} />
            <SocialProof />

            {/* 👇 AQUÍ INSERTAMOS EL COMPONENTE LIMPIO */}
            <KiqOutletSection />
            {/* ------------------------------------- */}

            <ComoFunciona />
            <Testimonios />
          </div>

          <FooterMinimal />

        </div>
      ) : (
        /* VISTA B: EL CHAT ACTIVO (Sin cambios) */
        <section className="w-full min-h-screen flex flex-col items-center bg-gray-50 py-6 px-4 md:px-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="w-full max-w-4xl flex flex-col h-[90vh]">
            
            <div className="flex justify-between items-center mb-4 px-2">
                <button 
                  onClick={handleVolver}
                  className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  ← Volver al inicio
                </button>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Asistente Inteligente Activo
                </span>
            </div>

            <div className="flex-grow bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">
              <ChatCalculadora 
                mode="public" 
                initialPrompt={promptInicial} 
              />
            </div>
            
             <p className="text-center text-xs text-gray-400 mt-4">
                Kiq Montajes AI v3.0 • Cotizaciones precisas en segundos
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
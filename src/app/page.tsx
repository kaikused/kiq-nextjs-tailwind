'use client';

import { useState } from 'react';
// Importamos dynamic para carga diferida (Lazy Loading)
import dynamic from 'next/dynamic';

// --- COMPONENTES CRÍTICOS (Se cargan al instante para el LCP) ---
import HeroModerno from './components/HeroModerno'; 
import CalculatorModal from './components/CalculatorModal'; 
import ChatCalculadora from './components/ChatCalculadora';

// --- COMPONENTES NO CRÍTICOS (Lazy Load para el 100/100 en Móvil) ---
// ssr: false significa que no se renderizan en el servidor, ahorrando HTML inicial
// loading: Muestra un esqueleto ligero mientras carga el componente real
const SocialProof = dynamic(() => import('./components/SocialProof'), { 
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
  ssr: true 
});

const KiqOutletSection = dynamic(() => import('./components/KiqOutletSection'), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
  ssr: true
});

const Testimonios = dynamic(() => import('./components/Testimonios'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
  ssr: true
});

const CtaFinal = dynamic(() => import('./components/CtaFinal'), {
  ssr: true
});

const FooterMinimal = dynamic(() => import('./components/FooterMinimal'), {
  ssr: true
});


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
      
      {/* El modal siempre listo pero oculto */}
      <CalculatorModal />

      {!cotizacionActiva ? (
        /* VISTA A: LA HOME */
        <div className="animate-in fade-in duration-500 flex flex-col min-h-screen">
          
          <div className="flex-grow">
            {/* El Hero es crítico, se carga normal */}
            <HeroModerno onStartCotizacion={handleStartCotizacion} />
            
            {/* El resto se carga progresivamente para no bloquear el móvil */}
            <SocialProof />
            <CtaFinal/>
            <KiqOutletSection />
            <Testimonios />
          </div>

          <FooterMinimal />

        </div>
      ) : (
        /* VISTA B: EL CHAT ACTIVO */
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
                Kiq Montajes AI • Cotizaciones precisas en segundos
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
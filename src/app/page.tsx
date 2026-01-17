'use client';

import { useState } from 'react';
// Importamos dynamic para carga diferida (Lazy Loading)
import dynamic from 'next/dynamic';

// --- COMPONENTES CRÍTICOS (Se cargan al instante para el LCP) ---
import HeroAspiracional from './components/HeroAspiracional'; 
import CalculatorModal from './components/CalculatorModal'; 
import ChatCalculadora from './components/ChatCalculadora';

// --- COMPONENTES NO CRÍTICOS (Lazy Load para el 100/100 en Móvil) ---
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
    // No hace falta scrollTo(0) porque el fixed z-index ya lo pone encima de todo
  };

  const handleVolver = () => {
    setCotizacionActiva(false);
    setPromptInicial('');
  };

  return (
    <main className="min-h-screen bg-white selection:bg-indigo-100">
      
      {/* El modal siempre listo pero oculto */}
      <CalculatorModal />

      {!cotizacionActiva ? (
        /* VISTA A: LA HOME (Ahora Aspiracional "Apple Style") */
        <div className="animate-in fade-in duration-500 flex flex-col min-h-screen">
          
          <div className="flex-grow">
            {/* Renderizamos HeroAspiracional */}
            <HeroAspiracional onOpenCalculator={() => handleStartCotizacion('')} />
            
            {/* El resto se carga progresivamente */}
            <div id="servicios-section"> {/* Ancla para el scroll suave */}
                <SocialProof />
            </div>
            <CtaFinal/>
            <KiqOutletSection />
            <Testimonios />
          </div>

          <FooterMinimal />

        </div>
      ) : (
        /* VISTA B: EL CHAT ACTIVO (Modo Inmersivo) */
        /* CORRECCIÓN: fixed inset-0 z-[100] para tapar la cabecera sticky */
        <section className="fixed inset-0 z-[100] w-full h-screen bg-gray-50 flex flex-col items-center py-4 px-4 md:px-8 animate-in slide-in-from-bottom-10 fade-in duration-500 overflow-hidden">
            <div className="w-full max-w-4xl flex flex-col h-full md:h-[90vh]">
            
            <div className="flex justify-between items-center mb-4 px-2 shrink-0">
                <button 
                  onClick={handleVolver}
                  className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  ← Volver al inicio
                </button>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                    Asistente Inteligente Activo
                </span>
            </div>

            <div className="flex-grow bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative">
              <ChatCalculadora 
                mode="public" 
                initialPrompt={promptInicial} 
                onPublishSuccess={() => console.log("Lead capturado")}
              />
            </div>
            
             <p className="text-center text-[10px] text-gray-400 mt-3 shrink-0 uppercase tracking-widest">
                Kiq Montajes AI • Tecnología de Precisión
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
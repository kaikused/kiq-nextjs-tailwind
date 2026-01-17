'use client';

// Importamos el Contexto para poder abrir el Modal Global
import { useUI } from './context/UIContext';

// Importamos dynamic para carga diferida (Rendimiento)
import dynamic from 'next/dynamic';

// --- COMPONENTES CRÍTICOS ---
import HeroAspiracional from './components/HeroAspiracional'; 
// Ya no importamos ChatCalculadora aquí, porque vivirá dentro del Modal Global

// --- COMPONENTES NO CRÍTICOS (Lazy Load) ---
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
  // Conectamos con el estado global para abrir el modal
  const { openCalculatorModal } = useUI();

  return (
    <main className="min-h-screen bg-white selection:bg-indigo-100">
      
      <div className="animate-in fade-in duration-500 flex flex-col min-h-screen">
        
        <div className="flex-grow">
          {/* 🚀 CAMBIO CLAVE: 
             Cuando el usuario pulse el botón del Hero, llamamos a openCalculatorModal('public').
             Esto abrirá EL MISMO MODAL que usas en la cabecera. Adiós problemas de solapamiento.
          */}
          <HeroAspiracional onOpenCalculator={() => openCalculatorModal('public')} />
          
          <div id="servicios-section">
              <SocialProof />
          </div>
          <CtaFinal/>
          <KiqOutletSection />
          <Testimonios />
        </div>

        <FooterMinimal />

      </div>
    </main>
  );
}
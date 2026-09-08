'use client';

// Importamos el Contexto para poder abrir el Modal Global
import { useUI } from './context/UIContext';

// Importamos dynamic para carga diferida (Rendimiento)
import dynamic from 'next/dynamic';

// --- COMPONENTES CRÍTICOS ---
import HeroAspiracional from './components/HeroAspiracional'; 
// Ya no importamos ChatCalculadora aquí, porque vivirá dentro del Modal Global

// --- COMPONENTES NO CRÍTICOS (Lazy Load) ---
const ComoFunciona = dynamic(() => import('./components/ComoFunciona'), {
  ssr: true
});

const SocialProof = dynamic(() => import('./components/SocialProof'), { 
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
    <div className="min-h-screen bg-white selection:bg-indigo-100">
      <HeroAspiracional onOpenCalculator={() => openCalculatorModal('public')} />
      <ComoFunciona />
      <div id="servicios-section">
        <SocialProof />
      </div>
      <Testimonios />
      <CtaFinal />
      <FooterMinimal />
    </div>
  );
}
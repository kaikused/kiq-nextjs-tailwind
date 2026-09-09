'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUI } from '../context/UIContext';
import { FaTimes } from 'react-icons/fa';

const ChatCalculadora = dynamic(() => import('./ChatCalculadora'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-white/55 text-sm">
      Cargando cotizador…
    </div>
  ),
});

export default function CalculatorModal() {
  const { isCalculatorModalOpen, closeModals, calculatorMode, calculatorPrompt, userProfile } = useUI();

  useEffect(() => {
    if (!isCalculatorModalOpen) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [isCalculatorModalOpen]);

  if (!isCalculatorModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/55 backdrop-blur-md md:items-center md:p-4 overscroll-none">
      <div
        className="relative flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-[#12141a] md:h-[min(90dvh,880px)] md:rounded-[2rem] md:ring-1 md:ring-white/15 md:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:px-5 md:py-4">
          <h3 className="font-titulo text-lg font-bold text-white">
            Pedir precio
          </h3>
          <button
            onClick={closeModals}
            className="rounded-full bg-white/10 p-2.5 text-white/70 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white focus:outline-none"
            aria-label="Cerrar cotizador"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0e1014]">
          <ChatCalculadora
            onPublishSuccess={closeModals}
            mode={calculatorMode || 'lite'}
            initialPrompt={calculatorPrompt}
            initialUserName={userProfile?.nombre}
          />
        </div>
      </div>
    </div>
  );
}

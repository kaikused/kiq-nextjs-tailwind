'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUI } from '../context/UIContext';
import { FaTimes } from 'react-icons/fa';

const ChatCalculadora = dynamic(() => import('./ChatCalculadora'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-600 text-sm">
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
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-slate-900/10 backdrop-blur-sm md:items-center md:p-4 overscroll-none">
      <div
        className="relative flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white/35 ring-1 ring-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-3xl md:h-[min(90dvh,880px)] md:rounded-[2rem]"
        style={{ WebkitBackdropFilter: 'blur(48px) saturate(1.7)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-white/35 bg-white/25 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:px-5 md:py-4">
          <h3 className="font-titulo text-lg font-bold text-slate-900">
            Pedir precio
          </h3>
          <button
            onClick={closeModals}
            className="rounded-full bg-white/40 p-2.5 text-slate-600 ring-1 ring-white/50 transition-colors hover:bg-white/70 hover:text-slate-900 focus:outline-none"
            aria-label="Cerrar cotizador"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
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

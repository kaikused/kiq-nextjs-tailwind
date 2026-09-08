'use client';
import { useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { FaTimes } from 'react-icons/fa';
import ChatCalculadora from './ChatCalculadora';

export default function CalculatorModal() {
  const { isCalculatorModalOpen, closeModals, calculatorMode, userProfile } = useUI();

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
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center bg-black/80 md:items-center md:p-4 overscroll-none">
      <div
        className="relative flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white md:h-[min(90dvh,880px)] md:rounded-2xl md:ring-1 md:ring-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5 md:py-4">
          <h3 className="font-titulo text-lg font-bold text-slate-900">
            Pedir precio
          </h3>
          <button
            onClick={closeModals}
            className="rounded-full bg-slate-100 p-2.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 focus:outline-none"
            aria-label="Cerrar cotizador"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-50">
          <ChatCalculadora
            onPublishSuccess={closeModals}
            mode={calculatorMode || 'lite'}
            initialUserName={userProfile?.nombre}
          />
        </div>
      </div>
    </div>
  );
}

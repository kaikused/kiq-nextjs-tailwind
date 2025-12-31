'use client';
import Link from 'next/link';
import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

interface HeaderProps {
  // Función para abrir el modal de inicio de sesión/registro
  onOpenLogin: () => void; 
}

export default function HeaderModerno({ onOpenLogin }: HeaderProps) {
  
  // Función simulada de acceso a la calculadora, a conectar luego en page.tsx
  const onOpenCalculator = () => alert("Abriendo flujo de Calculadora/Cotización");

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center max-w-7xl">
        
        {/* --- Logo --- */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-slate-900">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            K
          </div>
          <span>Kiq Montajes</span>
        </Link>

        {/* --- Botones de Acción (Lado Derecho) --- */}
        <div className="flex items-center gap-3">
          
          {/* 1. Ser Kiqer (Montador) */}
          <Link 
            href="/soy-montador" 
            className="px-4 py-2 rounded-full text-sm font-bold text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition"
          >
            Ser Kiqer
          </Link>

          {/* 2. Inicio/Registro */}
          <button 
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-full text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md flex items-center gap-1"
          >
            Inicio/Registro
          </button>
          
          {/* 3. Pedir Precio (Destacado) */}
          <button 
            onClick={onOpenCalculator}
            className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-indigo-500/20 hidden sm:block"
          >
            Pedir Precio
          </button>
        </div>
      </div>
    </nav>
  );
}
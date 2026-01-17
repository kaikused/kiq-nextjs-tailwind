'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '../context/UIContext'; // Importamos el contexto para saber si está logueado
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenCalculator?: () => void;
}

export default function HeaderModerno({ onOpenLogin, onOpenCalculator }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile } = useUI(); // Obtenemos el perfil del usuario
  const pathname = usePathname();

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lógica de estilos:
  // Es transparente SOLO si estamos en la Home ('/') Y no hemos bajado el scroll.
  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled;

  // Clases dinámicas
  const navBackground = isTransparent 
    ? 'bg-transparent border-transparent' 
    : 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm';
  
  const textColor = isTransparent ? 'text-white' : 'text-slate-900';
  
  // El logo necesita un fondo blanco si el texto es oscuro, o ser sutil si es transparente
  const logoBg = isTransparent ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-indigo-600 text-white';

  const buttonOutlineClass = isTransparent
    ? 'text-white border-white hover:bg-white/10'
    : 'text-indigo-600 border-indigo-600 hover:bg-indigo-50';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBackground}`}>
      <div className="container mx-auto px-6 h-20 flex justify-between items-center max-w-7xl">
        
        {/* --- Logo --- */}
        <Link 
          href="/" 
          aria-label="Ir al inicio"
          className={`flex items-center gap-2 font-extrabold text-xl tracking-tight transition-colors ${textColor}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors ${logoBg}`}>
            K
          </div>
          <span>Kiq Montajes</span>
        </Link>

        {/* --- Menú Desktop --- */}
        <div className="hidden md:flex items-center gap-4">
          
          <Link 
            href="/soy-montador" 
            className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${buttonOutlineClass}`}
          >
            Soy Montador
          </Link>

          {/* Lógica de Usuario: Si hay perfil, mostramos "Mi Panel", si no, "Entrar" */}
          {userProfile ? (
            <Link 
                href={userProfile.tipo === 'montador' ? '/panel-montador' : '/panel-cliente'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:scale-105 transition-all"
            >
                <FaUserCircle size={16} />
                <span>Mi Panel</span>
            </Link>
          ) : (
            <button 
                onClick={onOpenLogin}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md hover:scale-105"
            >
                Entrar / Registro
            </button>
          )}

          {/* Botón Pedir Precio (Solo visible si NO es transparente para no saturar el Hero) */}
          <button 
            onClick={onOpenCalculator}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg ${
                isTransparent 
                ? 'bg-white text-indigo-900 hover:bg-gray-100' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Pedir Precio
          </button>
        </div>

        {/* --- Botón Móvil --- */}
        <button 
            className={`md:hidden p-2 rounded-lg transition-colors ${textColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* --- Menú Móvil Desplegable --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-5 p-6 flex flex-col gap-4">
             <Link href="/soy-montador" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-800 py-2 border-b border-gray-50">Soy Montador</Link>
             
             {userProfile ? (
                 <Link href={userProfile.tipo === 'montador' ? '/panel-montador' : '/panel-cliente'} onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold">Ir a mi Panel</Link>
             ) : (
                 <button onClick={() => { onOpenLogin(); setIsMobileMenuOpen(false); }} className="w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold">Entrar / Registro</button>
             )}
             
             <button onClick={() => { if(onOpenCalculator) onOpenCalculator(); setIsMobileMenuOpen(false); }} className="w-full text-center bg-slate-900 text-white py-3 rounded-xl font-bold">
                Pedir Precio
             </button>
        </div>
      )}
    </nav>
  );
}
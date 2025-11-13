// En: src/components/Cabecera.tsx (¡VERSIÓN LIMPIA, SIN IDIOMAS!)

"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function Cabecera() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, ancla: string) => {
    // Comprobamos si estamos en la home (ruta "/")
    if (window.location.pathname === '/') {
      e.preventDefault(); // Prevenir el salto brusco
      const elementoId = ancla.substring(1);
      const elemento = document.getElementById(elementoId);

      if (elemento) {
        elemento.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    // Si no estamos en la home (ej: /presupuesto), dejamos que el href (ej: /#tarifas)
    // nos lleve a la home y a la sección correcta.

    setIsMenuOpen(false); // Siempre cerramos el menú móvil
  };

  return (
    <>
      <nav className="bg-superficie shadow-md sticky top-0 z-50">
        {/* Contenedor Principal */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo (con scroll suave) */}
          <div className="navbar-logo z-50">
            <a href="/#inicio" onClick={(e) => handleScroll(e, '#inicio')}>
              <Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={100} height={40} className="h-10 w-auto" />
            </a>
          </div>

          {/* Contenedor de Menú (Derecha) */}
          <div className="flex items-center space-x-4">

            {/* --- SELECTOR DE IDIOMA ELIMINADO --- */}

            {/* --- MENÚ DE ESCRITORIO --- */}
            <nav id="main-nav-desktop" className="hidden md:flex">
              <ul className="flex items-center space-x-6">
                <li><a href="/#inicio" className="font-bold text-primario-oscuro transition-colors hover:text-acento" onClick={(e) => handleScroll(e, '#inicio')}>Inicio</a></li>
                <li><a href="/#quienes-somos" className="font-bold text-primario-oscuro transition-colors hover:text-acento" onClick={(e) => handleScroll(e, '#quienes-somos')}>Quiénes Somos</a></li>
                <li><a href="/#nuestro-trabajo" className="font-bold text-primario-oscuro transition-colors hover:text-acento" onClick={(e) => handleScroll(e, '#nuestro-trabajo')}>Nuestro Trabajo</a></li>
                <li><a href="/#tarifas" className="font-bold text-primario-oscuro transition-colors hover:text-acento" onClick={(e) => handleScroll(e, '#tarifas')}>Tarifas</a></li>
                <li><a href="/#contacto" className="font-bold text-primario-oscuro transition-colors hover:text-acento" onClick={(e) => handleScroll(e, '#contacto')}>Contacto</a></li>
                <li><a href="/presupuesto" className="rounded-md bg-acento px-4 py-2 font-bold text-primario-oscuro transition-opacity hover:opacity-80">Calcular Presupuesto</a></li>
              </ul>
            </nav>

            {/* --- BOTÓN HAMBURGUESA --- */}
            <div 
              id="hamburger-icon" 
              className="hamburger-icon md:hidden cursor-pointer z-50"
              onClick={() => setIsMenuOpen(true)}
            >
              <div className="h-1 w-6 bg-primario-oscuro"></div>
              <div className="my-1 h-1 w-6 bg-primario-oscuro"></div>
              <div className="h-1 w-6 bg-primario-oscuro"></div>
            </div>

          </div>
        </div>
      </nav>

      {/* --- MENÚ MÓVIL DESPLEGABLE --- */}
      <div 
        id="main-nav-mobile"
        className={`
          fixed top-0 left-0 w-full h-full md:hidden z-40 
          transition-opacity duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <div 
          className={`
            relative w-full bg-superficie shadow-lg p-6
            transition-transform duration-300 ease-in-out
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}
          `}
        >
          {/* Fila superior: Logo, X */}
          <div className="flex items-center justify-between mb-8">
            <div className="navbar-logo">
  <a href="/#inicio" onClick={(e) => handleScroll(e, '#inicio')}>
    <Image 
      src="/images/logo-kiq.svg" 
      alt="Logo KIQ" 
      width={100}
      height={40}
      className="h-10 w-auto"
    />
  </a> 
{/* 👈 ¡Añade esta etiqueta de cierre! */}
</div>

            {/* --- SELECTOR DE IDIOMA MÓVIL ELIMINADO --- */}

            {/* Botón de cierre (la X) */}
            <div 
              className="cursor-pointer text-primario-oscuro z-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          </div>

          {/* Lista de enlaces del menú móvil */}
          <ul className="flex flex-col items-center space-y-6">
            <li><a href="/#inicio" className="text-xl font-bold text-primario-oscuro hover:text-acento" onClick={(e) => handleScroll(e, '#inicio')}>Inicio</a></li>
            <li><a href="/#quienes-somos" className="text-xl font-bold text-primario-oscuro hover:text-acento" onClick={(e) => handleScroll(e, '#quienes-somos')}>Quiénes Somos</a></li>
            <li><a href="/#nuestro-trabajo" className="text-xl font-bold text-primario-oscuro hover:text-acento" onClick={(e) => handleScroll(e, '#nuestro-trabajo')}>Nuestro Trabajo</a></li>
            <li><a href="/#tarifas" className="text-xl font-bold text-primario-oscuro hover:text-acento" onClick={(e) => handleScroll(e, '#tarifas')}>Tarifas</a></li>
            <li><a href="/#contacto" className="text-xl font-bold text-primario-oscuro hover:text-acento" onClick={(e) => handleScroll(e, '#contacto')}>Contacto</a></li>
            <li className="w-full pt-4"><a href="/presupuesto" className="block w-full text-center rounded-md bg-acento px-6 py-3 text-xl font-bold text-primario-oscuro transition-opacity hover:opacity-80">Calcular Presupuesto</a></li>
          </ul>
        </div>
      </div>
    </>
  );
}
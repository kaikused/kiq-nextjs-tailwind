'use client'; // Necesario para detectar la ruta
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  // Detectamos si estamos en una ruta de panel (cliente o montador)
  const esPanel = pathname?.startsWith('/panel');

  // ============================================================
  //  MODO 1: FOOTER DE PANEL (Ultra Minimalista)
  // ============================================================
  if (esPanel) {
    return (
      <footer className="bg-transparent py-6 mt-auto border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Kiq Montajes | Panel de Gestión
          </p>
        </div>
      </footer>
    );
  }

  // ============================================================
  //  MODO 2: FOOTER PÚBLICO (Tu diseño original intacto)
  // ============================================================
  return (
    <footer className="bg-superficie border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        {/* --- CONTENEDOR DE ENLACES (El Grid) --- */}
        {/* 2 columnas en móvil, 4 en escritorio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-left">
          
          {/* Columna 1: Empresa */}
          <div>
            <h3 className="font-bold text-primario-oscuro mb-3">Kiq</h3>
            <ul className="space-y-2">
              <li><Link href="/#quienes-somos" className="text-texto-secundario hover:text-primario-oscuro">Quiénes Somos</Link></li>
              <li><Link href="/#nuestro-trabajo" className="text-texto-secundario hover:text-primario-oscuro">Nuestro Trabajo</Link></li>
              <li><Link href="/#contacto" className="text-texto-secundario hover:text-primario-oscuro">Contacto</Link></li>
            </ul>
          </div>

          {/* Columna 2: Clientes */}
          <div>
            <h3 className="font-bold text-primario-oscuro mb-3">Clientes</h3>
            <ul className="space-y-2">
              <li><Link href="/presupuesto" className="text-texto-secundario hover:text-primario-oscuro">Calcular Presupuesto</Link></li>
              <li><Link href="/#tarifas" className="text-texto-secundario hover:text-primario-oscuro">Tarifas</Link></li>
              <li><Link href="/acceso" className="text-texto-secundario hover:text-primario-oscuro">Iniciar Sesión</Link></li>
            </ul>
          </div>

          {/* Columna 3: Montadores */}
          <div>
            <h3 className="font-bold text-primario-oscuro mb-3">Montadores</h3>
            <ul className="space-y-2">
              <li><Link href="/montador/acceso" className="text-texto-secundario hover:text-primario-oscuro">Hazte Kiqer</Link></li>
              <li><Link href="/acceso" className="text-texto-secundario hover:text-primario-oscuro">Iniciar Sesión</Link></li>
            </ul>
          </div>

          {/* Columna 4: Legal */}
          <div>
            <h3 className="font-bold text-primario-oscuro mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/legal/terminos" className="text-texto-secundario hover:text-primario-oscuro">Términos de Servicio</Link></li>
              <li><Link href="/legal/privacidad" className="text-texto-secundario hover:text-primario-oscuro">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>

        {/* --- SECCIÓN INFERIOR (Logo y Copyright) --- */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <Image 
            src="/images/logo-kiq.svg" 
            alt="Logo KIQ Montajes" 
            width={150}
            height={50}
            className="h-14 w-auto mx-auto mb-4"
          />
          <p className="text-texto-secundario text-sm mb-2">
            Servicio de Montaje de Muebles en Málaga.
          </p>
          <p className="text-texto-secundario text-sm">
            &copy; {new Date().getFullYear()} KIQ | Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
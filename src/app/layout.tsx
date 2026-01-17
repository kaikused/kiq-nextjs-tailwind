import type { Metadata } from 'next';
import { Manrope, Permanent_Marker, Work_Sans } from 'next/font/google';
import './globals.css';

// Importamos el proveedor de contexto (estado global)
import { UIProvider } from './context/UIContext'; 

// Importamos componentes globales
import Cabecera from './components/Cabecera'; 

// Importamos los Modales Globales
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CalculatorModal from './components/CalculatorModal'; 
import RecoveryModal from './components/RecoveryModal'; 

// Configuración de fuentes OPTIMIZADA (display: swap)
const workSans = Work_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-family-base',
  display: 'swap', // 🚀 CRÍTICO para el 100 en PageSpeed (Evita bloqueo de renderizado)
});

const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['800'],
  variable: '--font-family-titulo',
  display: 'swap', // 🚀 CRÍTICO
});

const permanentMarker = Permanent_Marker({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-family-especial',
  display: 'swap', // 🚀 CRÍTICO
});

export const metadata: Metadata = {
  title: 'KIQ - Montaje de Muebles',
  description: 'El marketplace de montadores de muebles en Málaga.',
  // Viewport optimizado para accesibilidad móvil (previene el error de "user-scalable=no")
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${workSans.variable} ${manrope.variable} ${permanentMarker.variable}`}>
      <body className="antialiased"> {/* antialiased hace que las fuentes se vean más nítidas */}
        <UIProvider>
          
          {/* La cabecera se mantiene global */}
          {/* OJO: Asegúrate de que Cabecera.tsx tenga el botón rosa en 'bg-pink-700' para accesibilidad */}
          <Cabecera />
          
          {/* Aquí se renderiza la página actual (Home, Panel, etc.) */}
          <main>
            {children}
          </main>
          
          {/* Modales disponibles en toda la aplicación */}
          <LoginModal />
          <RegisterModal />
          <CalculatorModal />
          <RecoveryModal />

        </UIProvider>
      </body>
    </html>
  );
}
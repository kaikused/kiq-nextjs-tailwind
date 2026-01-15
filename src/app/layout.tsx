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
// 👇 1. AÑADE ESTE IMPORT
import RecoveryModal from './components/RecoveryModal'; 

// Configuración de fuentes
const workSans = Work_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-family-base'
});
const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['800'],
  variable: '--font-family-titulo'
});
const permanentMarker = Permanent_Marker({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-family-especial'
});

export const metadata: Metadata = {
  title: 'KIQ - Montaje de Muebles',
  description: 'El marketplace de montadores de muebles en Málaga.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${workSans.variable} ${manrope.variable} ${permanentMarker.variable}`}>
      <body>
        <UIProvider>
          
          {/* La cabecera se mantiene global */}
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
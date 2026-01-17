import type { Metadata } from 'next';
import { Manrope, Permanent_Marker, Work_Sans } from 'next/font/google';
import './globals.css';
import { UIProvider } from './context/UIContext'; 
import Cabecera from './components/Cabecera'; // ✅ Correcto: Usamos el componente potente
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CalculatorModal from './components/CalculatorModal'; 
import RecoveryModal from './components/RecoveryModal'; 

const workSans = Work_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-family-base',
  display: 'swap',
});

const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['600', '800'],
  variable: '--font-family-titulo',
  display: 'swap',
});

const permanentMarker = Permanent_Marker({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-family-especial',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KIQ - Montaje de Muebles',
  description: 'El marketplace de montadores de muebles en Málaga.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ffffff', // Mejor blanco para que combine con el header transparente/blanco
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✨ MEJORA: scroll-smooth para que los botones de ancla (Hero) funcionen elegante
    <html lang="es" className={`${workSans.variable} ${manrope.variable} ${permanentMarker.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://kiq-calculadora.onrender.com" />
        <link rel="dns-prefetch" href="https://kiq-calculadora.onrender.com" />
      </head>
      {/* ✨ MEJORA: bg-white y text-slate-900 definen la base del diseño Apple */}
      <body className="antialiased bg-white text-slate-900">
        <UIProvider>
          <Cabecera />
          <main className="relative z-0">
            {children}
          </main>
          
          {/* Modales globales siempre listos */}
          <LoginModal />
          <RegisterModal />
          <CalculatorModal />
          <RecoveryModal />
        </UIProvider>
      </body>
    </html>
  );
}
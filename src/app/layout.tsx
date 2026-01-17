import type { Metadata } from 'next';
import { Manrope, Permanent_Marker, Work_Sans } from 'next/font/google';
import './globals.css';
import { UIProvider } from './context/UIContext'; 
import Cabecera from './components/Cabecera'; 
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CalculatorModal from './components/CalculatorModal'; 
import RecoveryModal from './components/RecoveryModal'; 

const workSans = Work_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-family-base',
  display: 'swap',
});

const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['800'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${workSans.variable} ${manrope.variable} ${permanentMarker.variable}`}>
      <head>
        {/* 🚀 OPTIMIZACIÓN LCP: Preconectar al backend para ahorrar 300ms en la carga de datos */}
        <link rel="preconnect" href="https://kiq-calculadora.onrender.com" />
        <link rel="dns-prefetch" href="https://kiq-calculadora.onrender.com" />
      </head>
      <body className="antialiased">
        <UIProvider>
          <Cabecera />
          <main>
            {children}
          </main>
          <LoginModal />
          <RegisterModal />
          <CalculatorModal />
          <RecoveryModal />
        </UIProvider>
      </body>
    </html>
  );
}
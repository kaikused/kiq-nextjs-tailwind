// En: src/app/layout.tsx (El Código de Fuentes)

import type { Metadata } from 'next';
// 1. Importa tus fuentes
import { Manrope, Permanent_Marker, Work_Sans } from 'next/font/google';
import './globals.css';

// 2. Configura las fuentes y asígnales una variable CSS
const workSans = Work_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-family-base' // Variable para la fuente base
});
const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['800'],
  variable: '--font-family-titulo' // Variable para la fuente del título
});
const permanentMarker = Permanent_Marker({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-family-especial' // Variable para la fuente especial
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
    // 3. Inyectamos las variables de fuente en el <html>
    <html lang="es" className={`${workSans.variable} ${manrope.variable} ${permanentMarker.variable}`}>
      <body>{children}</body>
    </html>
  );
}
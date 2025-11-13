// En: src/app/page.tsx (¡El Código Limpio y Refactorizado!)

// 1. Importamos el nuevo componente de Cabecera (¡es un Client Component!)
import Cabecera from '@/app/components/Cabecera';
import Hero from '@/app/components/Hero';
import QuienesSomos from '@/app/components/QuienesSomos';
import NuestrosResultados from './components/NuestrosResultados';
import Tarifas from './components/Tarifas';
import Testimonios from './components/Testimonios';
import Videos from './components/Videos';
import CtaFinal from './components/CtaFinal';
import Footer from './components/Footer';

// ¡Fíjate! Ya no hay "use client" ni 'useState' aquí.
export default function HomePage() {
  return (
    <main>
      {/* --- 1. CABECERA (Ahora es un componente limpio) --- */}
      <Cabecera />
      {/* --- 2. HERO (Ahora es un componente limpio)--- */}
      <Hero />
      {/* --- 3. SECCIÓN QUIÉNES SOMOS --- */}
      <QuienesSomos />
      {/* --- 4. SECCIÓN NUESTROS RESULTADOS --- */}
      <NuestrosResultados/>
      {/* --- 5. SECCIÓN TARIFAS --- */}
      <Tarifas/>
      {/* --- 6. SECCIÓN TESTIMONIOS --- */}
      <Testimonios/>
      {/* --- 7. SECCIÓN VÍDEOS --- */}
      <Videos/>
      {/* --- 8. SECCIÓN CTA FINAL --- */}
      <CtaFinal/>
      {/* --- 9. SECCIÓN FOOTER --- */}
      <Footer/>
</main>
); 
}
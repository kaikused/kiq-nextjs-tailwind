'use client';
import { FaInstagram, FaWhatsapp, FaGoogle, FaArrowUp, FaTiktok } from 'react-icons/fa';

export default function FooterMinimal() {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-gray-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Identidad y Redes Reales */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-xl font-black tracking-tighter mb-4">
              KIQ<span className="text-indigo-500">MONTAJES</span>
            </h3>
            <p className="text-sm leading-relaxed mb-6">
              Montaje profesional de mobiliario en Málaga. 
              Calidad y rapidez garantizada en cada instalación.
            </p>
            <div className="flex gap-5 items-center">
              {/* GOOGLE MAPS / RESEÑAS */}
              <a href="https://search.google.com/local/reviews?placeid=ChIJ1XtcHYfyly4Re1sFUXqtre8" 
                 target="_blank" rel="noopener noreferrer" aria-label="Ver opiniones en Google" 
                 className="hover:text-white transition-colors">
                <FaGoogle size={18} />
              </a>
              {/* INSTAGRAM */}
              <a href="https://www.instagram.com/kaikused/" 
                 target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram" 
                 className="hover:text-pink-500 transition-colors">
                <FaInstagram size={22} />
              </a>
              {/* TIKTOK */}
              <a href="https://www.tiktok.com/@kaikused" 
                 target="_blank" rel="noopener noreferrer" aria-label="Síguenos en TikTok" 
                 className="hover:text-cyan-400 transition-colors">
                <FaTiktok size={20} />
              </a>
              {/* WHATSAPP */}
              <a href="https://wa.me/34664497889" 
                 target="_blank" rel="noopener noreferrer" aria-label="Contacto directo WhatsApp" 
                 className="hover:text-green-500 transition-colors">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>

          {/* 2. Navegación Rápida */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#servicios-section" className="hover:text-indigo-400 transition-colors">Servicios</a></li>
              <li><a href="#testimonios" className="hover:text-indigo-400 transition-colors">Reseñas Clientes</a></li>
              <li><a href="#contacto" className="hover:text-indigo-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* 3. Área de Servicio */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Cobertura</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-2 italic">
                <span className="text-indigo-500 font-bold">●</span> Málaga y toda la Costa del Sol.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">●</span> Presupuestos sin compromiso.
              </li>
            </ul>
          </div>

          {/* 4. Botón Volver Arriba */}
          <div className="flex flex-col items-start md:items-end justify-between">
            <button 
              onClick={scrollToTop}
              className="p-3 bg-slate-900 rounded-xl hover:bg-indigo-600 transition-all group shadow-2xl border border-slate-800"
              aria-label="Volver al inicio"
            >
              <FaArrowUp className="text-white group-hover:-translate-y-1 transition-transform" />
            </button>
            <div className="mt-8 md:mt-0 text-right opacity-30">
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white">
                    Kiq Technologies <br />
                    Málaga · {new Date().getFullYear()}
                </p>
            </div>
          </div>

        </div>

        {/* Copyright y Legal */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <p>© {new Date().getFullYear()} KIQ MONTAJES. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Aviso Legal</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
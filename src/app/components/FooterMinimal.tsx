'use client';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function FooterMinimal() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* 1. Identidad */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Kiq Montajes</h3>
          <p className="text-sm text-gray-500 mt-1">
            © {new Date().getFullYear()} Kiq Technologies. Málaga, España.
          </p>
        </div>

        {/* 2. Enlaces Legales */}
        {/* CORRECCIÓN: Usamos text-gray-600 para pasar el test de contraste de color */}
        <div className="flex gap-6 text-sm text-gray-600 font-medium">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Ayuda</a>
        </div>

        {/* 3. Redes Sociales */}
        {/* CORRECCIÓN: text-gray-400 era muy claro. Usamos gray-500. */}
        <div className="flex gap-4 text-gray-500">
          
          {/* CORRECCIÓN VITAL: Añadimos 'aria-label' a todos los iconos */}
          <a 
            href="#" 
            aria-label="Instagram de Kiq (Próximamente)" 
            className="hover:text-pink-600 transition-colors"
          >
            <FaInstagram size={20} />
          </a>

          <a 
            href="#" 
            aria-label="Twitter de Kiq (Próximamente)" 
            className="hover:text-blue-400 transition-colors"
          >
            <FaTwitter size={20} />
          </a>

          <a 
            href="#" 
            aria-label="LinkedIn de Kiq (Próximamente)" 
            className="hover:text-blue-700 transition-colors"
          >
            <FaLinkedin size={20} />
          </a>

        </div>

      </div>
    </footer>
  );
}
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

        {/* 2. Enlaces Legales (Placeholders) */}
        <div className="flex gap-6 text-sm text-gray-500 font-medium">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Ayuda</a>
        </div>

        {/* 3. Redes Sociales (Decorativo por ahora) */}
        <div className="flex gap-4 text-gray-400">
          <a href="#" className="hover:text-pink-600 transition-colors"><FaInstagram size={20} /></a>
          <a href="#" className="hover:text-blue-400 transition-colors"><FaTwitter size={20} /></a>
          <a href="#" className="hover:text-blue-700 transition-colors"><FaLinkedin size={20} /></a>
        </div>

      </div>
    </footer>
  );
}
'use client';
import Image from 'next/image';
import { FaInstagram, FaWhatsapp, FaGoogle, FaTiktok } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const WHATSAPP_LINK =
  'https://wa.me/34664497889?text=' +
  encodeURIComponent('Hola, vengo de kiq.es. Quiero un presupuesto de montaje.');

export default function FooterMinimal() {
  const { openCalculatorModal } = useUI();

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <Image
              src="/images/logo-kiq.svg"
              alt="Kiq Montajes"
              width={100}
              height={36}
              className="h-8 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              Montaje de muebles en Málaga y Costa del Sol. Presupuesto en minutos, cierre por WhatsApp.
            </p>
            <a
              href="tel:+34664497889"
              className="text-white font-medium text-sm hover:text-indigo-300 transition-colors"
            >
              664 497 889
            </a>
            <div className="flex gap-5 items-center mt-5">
              <a
                href="https://search.google.com/local/reviews?placeid=ChIJ1XtcHYfyly4Re1sFUXqtre8"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Opiniones en Google"
                className="hover:text-white transition-colors"
              >
                <FaGoogle size={16} />
              </a>
              <a
                href="https://www.instagram.com/kaikused/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@kaikused"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:text-white transition-colors"
              >
                <FaTiktok size={16} />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hover:text-white transition-colors"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-titulo text-white font-semibold mb-5 text-sm">En esta página</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#como-funciona" className="hover:text-white transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#servicios-section" className="hover:text-white transition-colors">
                  Trabajos
                </a>
              </li>
              <li>
                <a href="#testimonios" className="hover:text-white transition-colors">
                  Reseñas
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-titulo text-white font-semibold mb-5 text-sm">Pedir presupuesto</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openCalculatorModal('public')}
                  className="hover:text-white transition-colors"
                >
                  Pedir precio
                </button>
              </li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
              <li className="text-slate-500">Málaga y Costa del Sol</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Kiq Montajes. Málaga.</p>
        </div>
      </div>
    </footer>
  );
}

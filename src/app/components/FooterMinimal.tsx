'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaWhatsapp, FaGoogle, FaTiktok } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const WHATSAPP_LINK =
  'https://wa.me/34664497889?text=' +
  encodeURIComponent('Hola, vengo de kiq.es. Quiero un presupuesto de montaje.');

export default function FooterMinimal() {
  const { openCalculatorModal } = useUI();

  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
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
              className="inline-flex min-h-11 items-center text-white font-medium text-sm hover:text-indigo-200 transition-colors"
            >
              664 497 889
            </a>
            <div className="flex gap-1 items-center mt-5">
              <a
                href="https://search.google.com/local/reviews?placeid=ChIJ1XtcHYfyly4Re1sFUXqtre8"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Opiniones en Google"
                className="inline-flex items-center justify-center w-12 h-12 text-slate-300 hover:text-white transition-colors"
              >
                <FaGoogle size={20} />
              </a>
              <a
                href="https://www.instagram.com/kaikused/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-12 h-12 text-slate-300 hover:text-white transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@kaikused"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex items-center justify-center w-12 h-12 text-slate-300 hover:text-white transition-colors"
              >
                <FaTiktok size={20} />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex items-center justify-center w-12 h-12 text-slate-300 hover:text-white transition-colors"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-titulo text-white font-semibold mb-5 text-sm">En esta página</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#como-funciona" className="inline-flex min-h-11 items-center hover:text-white transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#servicios-section" className="inline-flex min-h-11 items-center hover:text-white transition-colors">
                  Trabajos
                </a>
              </li>
              <li>
                <a href="#testimonios" className="inline-flex min-h-11 items-center hover:text-white transition-colors">
                  Reseñas
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-titulo text-white font-semibold mb-5 text-sm">Pedir presupuesto</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openCalculatorModal('public')}
                  className="inline-flex min-h-11 items-center hover:text-white transition-colors"
                >
                  Pedir precio
                </button>
              </li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
              <li className="text-slate-400">Málaga y Costa del Sol</li>
              <li>
                <Link href="/soy-montador" className="inline-flex min-h-11 items-center hover:text-white transition-colors">
                  Soy montador
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Kiq Montajes. Málaga.</p>
        </div>
      </div>
    </footer>
  );
}

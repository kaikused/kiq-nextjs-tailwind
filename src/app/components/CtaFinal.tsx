// En: src/app/components/CtaFinal.tsx

// 1. Importamos los iconos que SÍ se usan en ESTE componente
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function CtaFinal() {
  return (
    <section id="contacto" className="bg-primario-oscuro py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h2 className="font-titulo text-4xl font-bold text-superficie">
          ¿Listo Para Montar?
        </h2>
        <div className="w-20 h-1 bg-acento mx-auto mt-4 mb-6"></div>
        <p className="text-lg text-superficie mb-8">
          Pide tu presupuesto sin compromiso. La forma más rápida es por WhatsApp.
          ¡Envíanos una foto del mueble y te respondemos al instante!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="https://wa.me/34XXXXXXXXX" // <-- ¡RECUERDA CAMBIAR ESTE NÚMERO!
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center rounded-lg bg-green-500 px-8 py-3 font-bold text-superficie transition-transform duration-300 hover:scale-105"
          >
            <FaWhatsapp className="h-6 w-6 mr-2" />
            WHATSAPP
          </a>
          <a 
            href="tel:+34XXXXXXXXX" // <-- ¡RECUERDA CAMBIAR ESTE NÚMERO!
            className="inline-flex items-center justify-center rounded-lg bg-acento px-8 py-3 font-bold text-primario-oscuro transition-transform duration-300 hover:scale-105"
          >
            <FaPhoneAlt className="h-6 w-6 mr-2" />
            LLAMAR AHORA
          </a>
        </div>
      </div>
    </section>
  );
}
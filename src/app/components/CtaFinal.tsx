// En: src/app/components/CtaFinal.tsx
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function CtaFinal() {
  return (
    <section id="contacto" className="bg-slate-900 py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        
        {/* Título: Alto contraste (Blanco sobre Slate-900) */}
        <h2 className="text-4xl font-bold text-white tracking-tight">
          ¿Listo Para Montar?
        </h2>
        
        {/* Separador decorativo */}
        <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 mb-6 rounded-full"></div>
        
        {/* Texto descriptivo: Gris claro para reducir fatiga visual pero manteniendo contraste */}
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          Pide tu presupuesto sin compromiso. La forma más rápida es por WhatsApp.
          ¡Envíanos una foto del mueble y te respondemos al instante!
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          
          {/* BOTÓN WHATSAPP */}
          {/* CORRECCIÓN: Usamos green-600 en lugar de 500 para pasar el test de accesibilidad */}
          <a 
            href="https://wa.me/34664497889" // <-- ¡RECUERDA CAMBIAR ESTE NÚMERO!
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Contactar por WhatsApp para pedir presupuesto"
            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-8 py-3 font-bold text-white transition-all duration-300 hover:bg-green-700 hover:scale-105 shadow-lg shadow-green-900/20"
          >
            <FaWhatsapp className="h-6 w-6 mr-2" />
            WHATSAPP
          </a>
          
          {/* BOTÓN LLAMADA */}
          {/* Diseño moderno: Botón blanco para resaltar sobre el fondo oscuro */}
          <a 
            href="tel:+34664497889" // <-- ¡RECUERDA CAMBIAR ESTE NÚMERO!
            aria-label="Llamar por teléfono ahora"
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 font-bold text-slate-900 transition-all duration-300 hover:bg-gray-100 hover:scale-105 shadow-lg"
          >
            <FaPhoneAlt className="h-5 w-5 mr-2" />
            LLAMAR AHORA
          </a>

        </div>
      </div>
    </section>
  );
}
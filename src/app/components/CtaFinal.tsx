'use client'; 
import { FaWhatsapp, FaPhoneAlt, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";

export default function CtaFinal() {
  
  const WHATSAPP_LINK = "https://wa.me/34664497889";
  const CALL_LINK = "tel:+34664497889";

  return (
    <section id="contacto" className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-28 px-6 overflow-hidden">
      
      {/* Efecto de luz de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
          Montamos Tus Muebles. <span className="text-indigo-400 italic">Sin Estrés y Hoy Mismo.</span>
        </h2>
        
        <div className="w-20 h-1 bg-indigo-500 mx-auto mt-6 mb-8 rounded-full"></div>
        
        <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-lg mx-auto">
          Pide tu presupuesto <strong className="text-white">gratuito</strong> en minutos. <br />
          Envíanos una foto del mueble por WhatsApp y <span className="text-white font-semibold">te respondemos al instante.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          
          <motion.a 
            href={WHATSAPP_LINK} 
            target="_blank" 
            rel="noopener noreferrer" 
            animate={{ 
              boxShadow: [
                "0 0 0 0px rgba(34, 197, 94, 0.4)", 
                "0 0 0 15px rgba(34, 197, 94, 0.0)",
                "0 0 0 0px rgba(34, 197, 94, 0.0)"
              ]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center justify-center rounded-2xl bg-green-600 px-10 py-4 font-black text-white text-sm uppercase tracking-widest hover:bg-green-500 transition-colors shadow-2xl shadow-green-950/30 w-full sm:w-auto"
          >
            <FaWhatsapp className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
            WHATSAPP INMEDIATO
          </motion.a>
          
          <motion.a 
            href={CALL_LINK} 
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 font-black text-slate-950 text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-lg w-full sm:w-auto"
          >
            <FaPhoneAlt className="h-5 w-5 mr-3 text-slate-600" />
            LLAMAR AHORA
          </motion.a>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <FaClock className="text-indigo-600" /> Respuesta en <span className="text-gray-400">menos de 15 minutos</span> (L-V)
        </div>
      </motion.div>
    </section>
  );
}
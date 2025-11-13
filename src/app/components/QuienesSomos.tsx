// En: src/app/components/QuienesSomos.tsx (¡AHORA CON ANIMACIÓN!)

"use client"; // <-- ¡CAMBIO 1! Ahora es interactivo.

// --- ¡CAMBIO 2! Importamos "motion" de framer-motion ---
import { motion } from "framer-motion";
import Image from 'next/image';

export default function QuienesSomos() {
  return (
    // --- ¡CAMBIO 3! Cambiamos <section> por <motion.section> ---
    <motion.section 
      id="quienes-somos" 
      className="bg-fondo py-20 px-6"

      // --- ¡CAMBIO 4! Añadimos las propiedades de la animación ---
      initial={{ opacity: 0, y: 50 }}     // Estado Inicial: invisible y 50px abajo
      whileInView={{ opacity: 1, y: 0 }}  // Estado Final: visible y en su sitio
      viewport={{ once: true }}           // La animación solo ocurre 1 vez
      transition={{ duration: 0.5 }}      // La animación dura 0.5 segundos
    >
      {/* El resto de tu código HTML no cambia en absoluto */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-4xl font-titulo font-bold text-primario-oscuro mb-4">
          Quiénes Somos
        </h2>
        <div className="w-20 h-1 bg-acento mx-auto mb-12"></div>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-texto-principal text-base mb-4">
              En KIQ, montadores profesionales en Málaga, transformamos el montaje de muebles en una experiencia sencilla y sin estrés.
            </p>
            <p className="text-texto-principal text-base mb-4">
              Te ofrecemos un servicio a domicilio rápido y de máxima calidad con total flexibilidad horaria (incluyendo tardes y fines de semana). Contamos con las herramientas y experiencia adecuadas para cuidar cada detalle.
            </p>
            <p className="text-texto-principal text-base mb-4">
              Dejamos tu hogar impecable, retirando incluso los embalajes. ¡Tu satisfacción es nuestra prioridad!
            </p>
          </div>
          <div className="flex-1">
            <Image
              src="/images/montadores.png" 
              alt="Montadores de muebles profesionales en Málaga"
              width={600}  // 👈 Añade el ancho (pon el valor correcto de tu imagen)
              height={400} // 👈 Añade el alto (pon el valor correcto de tu imagen) 
              className="w-full h-auto"
              loading="lazy" 
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
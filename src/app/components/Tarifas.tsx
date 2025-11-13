// En: src/app/components/Tarifas.tsx (¡AHORA CON ANIMACIÓN!)

"use client"; // <-- ¡CAMBIO 1! Ahora es interactivo.

// --- ¡CAMBIO 2! Importamos "motion" de framer-motion ---
import { motion } from "framer-motion";
import Image from 'next/image';

export default function Tarifas() {
  return (
    // --- ¡CAMBIO 3! Cambiamos <section> por <motion.section> ---
    <motion.section 
      id="tarifas" 
      className="bg-fondo py-20 px-6"

      // --- ¡CAMBIO 4! Añadimos las propiedades de la animación ---
      initial={{ opacity: 0, y: 50 }}     // Estado Inicial: invisible y 50px abajo
      whileInView={{ opacity: 1, y: 0 }}  // Estado Final: visible y en su sitio
      viewport={{ once: true }}           // La animación solo ocurre 1 vez
      transition={{ duration: 0.5 }}      // La animación dura 0.5 segundos
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-4xl font-titulo font-bold text-primario-oscuro mb-4">
          Precios Claros y Sin Sorpresas
        </h2>
        <div className="w-20 h-1 bg-acento mx-auto mb-12"></div>
        <p className="text-center text-lg text-texto-secundario max-w-2xl mx-auto mb-12">
          Te ofrecemos una idea de nuestras tarifas. Para un precio exacto, la mejor opción es contactarnos.
        </p>

        {/* Contenedor de Tarjetas (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Tarjeta 1: Montaje Básico */}
          <div className="flex flex-col rounded-lg bg-superficie p-8 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2">
            <div className="mb-4"><Image src="/images/icono-mesita.svg" alt="Montaje Básico" width={64} height={64} className="h-16 w-16 mx-auto" /></div>
            <h3 className="font-titulo text-2xl font-bold text-primario-oscuro mb-3">Montaje Básico</h3>
            <p className="text-texto-secundario mb-6 flex-grow">Mesillas, sillas, estanterías sencillas, zapateros, muebles de baño...</p>
            <div className="text-3xl font-titulo font-bold text-primario-oscuro">Desde 30€</div>
          </div>

          {/* Tarjeta 2: Montaje Mediano */}
          <div className="flex flex-col rounded-lg bg-superficie p-8 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2">
            <div className="mb-4"><Image src="/images/icono-canape.svg" alt="Montaje Mediano" width={64} height={64} className="h-16 w-16 mx-auto" /></div>
            <h3 className="font-titulo text-2xl font-bold text-primario-oscuro mb-3">Montaje Mediano</h3>
            <p className="text-texto-secundario mb-6 flex-grow">Canapés, camas, cómodas grandes, sofás, mesas de comedor...</p>
            <div className="text-3xl font-titulo font-bold text-primario-oscuro">Desde 50€</div>
          </div>

          {/* Tarjeta 3: Montaje Grande */}
          <div className="flex flex-col rounded-lg bg-superficie p-8 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2">
            <div className="mb-4"><Image src="/images/icono-armario.svg" alt="Montaje Grande" width={64} height={64} className="h-16 w-16 mx-auto" /></div>
            <h3 className="font-titulo text-2xl font-bold text-primario-oscuro mb-3">Montaje Grande</h3>
            <p className="text-texto-secundario mb-6 flex-grow">Armarios complejos, dormitorios completos, cocinas, muebles a medida...</p>
            <div className="text-3xl font-titulo font-bold text-primario-oscuro">A Consultar</div>
          </div>

        </div>

        {/* Botón de "Estimar Presupuesto" */}
        <div className="text-center mt-12">
          <a 
            href="/presupuesto" 
            className="inline-block rounded-md bg-acento px-8 py-3 font-bold text-primario-oscuro transition-opacity hover:opacity-90"
          >
            Estimar Presupuesto
          </a>
        </div>

      </div>
    </motion.section>
  );
}
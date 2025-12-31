'use client';
import { FaCamera, FaRobot, FaUserCheck, FaArrowRight } from 'react-icons/fa';
import { useUI } from '../context/UIContext'; // <--- 1. IMPORTAR CONTEXTO

export default function ComoFunciona() {
  // 2. EXTRAER LA FUNCIÓN
  const { openCalculatorModal } = useUI();

  return (
    <section className="py-20 bg-gray-50 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            De una foto a tu salón listo, <br/>
            <span className="text-indigo-600">en 3 pasos.</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Sin visitas previas ni presupuestos inflados. Usamos tecnología para hacerlo fácil.
          </p>
        </div>

        {/* CONTENEDOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* LÍNEA CONECTORA (Solo visible en Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 -z-10 border-t-2 border-dashed border-indigo-300"></div>

          {/* --- PASO 1: LA FOTO --- */}
          <div className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
            {/* Badge Número */}
            <div className="w-12 h-12 bg-white border-4 border-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl mb-6 shadow-sm z-10 relative">
              1
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sube una foto</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Haz una foto a las cajas de IKEA o pega el link del mueble. No necesitas medir nada.
            </p>

            {/* ILUSTRACIÓN UI */}
            <div className="mt-auto w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 relative overflow-hidden group-hover:-translate-y-1 transition-transform">
               <div className="border-2 border-dashed border-indigo-200 bg-white rounded-xl h-24 flex flex-col items-center justify-center gap-2">
                  <FaCamera className="text-indigo-400 text-xl" />
                  <span className="text-[10px] text-gray-400 font-medium">Subir imagen...</span>
               </div>
               <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500 rounded-full blur-xl opacity-20"></div>
            </div>
          </div>

          {/* --- PASO 2: LA IA --- */}
          <div className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center md:-translate-y-4">
             {/* Badge Número */}
             <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg shadow-indigo-200 z-10 relative ring-4 ring-white">
              2
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Precio Inmediato</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Nuestra IA analiza las piezas y te da un precio cerrado al segundo. Lo aceptas y listo.
            </p>

            {/* ILUSTRACIÓN UI */}
            <div className="mt-auto w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 relative overflow-hidden group-hover:-translate-y-1 transition-transform">
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">🤖</div>
                        <div className="bg-indigo-600 text-white text-xs p-2 rounded-lg rounded-tl-none text-left w-full shadow-md">
                            Detectado: Armario PAX. <br/><strong>Precio: 45€</strong>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <div className="bg-white border border-gray-200 text-gray-600 text-xs p-2 rounded-lg rounded-tr-none">
                            ¡Genial, acepto!
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* --- PASO 3: EL EXPERTO --- */}
          <div className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
            {/* Badge Número */}
            <div className="w-12 h-12 bg-white border-4 border-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl mb-6 shadow-sm z-10 relative">
              3
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">Montaje Profesional</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Un Kiqer verificado va a tu casa, lo monta perfecto y tú liberas el pago al final.
            </p>

            {/* ILUSTRACIÓN UI */}
            <div className="mt-auto w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 relative overflow-hidden group-hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FaUserCheck />
                    </div>
                    <div className="text-left">
                        <div className="text-xs font-bold text-gray-800">Montador en camino</div>
                        <div className="text-[10px] text-gray-400">Llegada: 10:00 AM</div>
                    </div>
                </div>
            </div>
          </div>

        </div>

        {/* CTA FINAL */}
        <div className="mt-16 text-center">
            {/* 3. BOTÓN CONECTADO A LA ACCIÓN */}
            <button 
                onClick={() => openCalculatorModal('public')} 
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                Pruébalo ahora <FaArrowRight size={14} />
            </button>
            <p className="mt-4 text-xs text-gray-400">Sin registro previo. Cotiza gratis.</p>
        </div>

      </div>
    </section>
  );
}
'use client';
import Link from 'next/link';
import { FaCheckCircle, FaMoneyBillWave, FaCalendarAlt, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

export default function SoyMontadorPage() {
  return (
    <div className="bg-white font-sans text-gray-900">
      
      {/* --- HERO SECTION: IMPACTO --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white opacity-70"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-6 border border-indigo-100">
              Para Profesionales del Montaje
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900">
              Tu trabajo, tus reglas. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                Tu dinero asegurado.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Únete a la plataforma que elimina el regateo. Accede a trabajos confirmados, cobra al instante o asegura tu pago con tarjeta. Sin cuotas mensuales.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => alert("Aquí abrirías el Registro de Montador")}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl shadow-indigo-200/50 flex items-center justify-center gap-2"
              >
                Empezar a ganar dinero <FaArrowRight size={14}/>
              </button>
              <Link href="/" className="text-slate-600 font-medium hover:text-indigo-600 transition">
                ¿Buscas un montador? Clic aquí
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID: BENEFICIOS (DISEÑO MODERNO) --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">¿Por qué Kiq es diferente?</h2>
            <p className="text-gray-500">Olvídate de los portales de anuncios viejos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Card 1: Grande */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                <FaMoneyBillWave size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Modelo Híbrido de Cobro</h3>
              <p className="text-gray-500 mb-6">
                Tú eliges cómo quieres trabajar. Acepta pagos en efectivo directo del cliente (comisión baja) o pagos seguros con tarjeta retenidos por Kiq (sin riesgo de impago).
              </p>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg">Cobro Inmediato</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">Pago Asegurado</span>
              </div>
            </div>

            {/* Card 2: Vertical */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <FaShieldAlt size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Garantía Anti-Humo</h3>
              <p className="text-gray-500 text-sm">
                Si aceptas un trabajo y el cliente no responde, te devolvemos tus puntos (Gemas) automáticamente con un clic.
              </p>
            </div>

            {/* Card 3: Vertical */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <FaCalendarAlt size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Libertad Total</h3>
              <p className="text-gray-500 text-sm">
                Sin jefes ni horarios. Actívate cuando quieras. Solo pagas una pequeña comisión por éxito, nada de cuotas fijas mensuales.
              </p>
            </div>

            {/* Card 4: Grande */}
            <div className="md:col-span-2 bg-slate-900 p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              {/* Efecto de fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">¿Listo para empezar?</h3>
                <p className="text-slate-400">Tus primeros trabajos tienen 0% de comisión.</p>
              </div>
              <button 
                 onClick={() => alert("Registro")}
                 className="relative z-10 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition whitespace-nowrap"
              >
                Crear Cuenta Gratis
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLE --- */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
        <p className="text-gray-400 text-sm">© 2025 Kiq Montajes. Hecho para profesionales.</p>
      </footer>
    </div>
  );
}
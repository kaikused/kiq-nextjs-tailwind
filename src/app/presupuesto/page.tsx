// En: src/app/presupuesto/page.tsx (¡EL CÓDIGO CORREGIDO!)

// Importamos los componentes que ya tenemos
import Cabecera from '@/app/components/Cabecera';
import Footer from '@/app/components/Footer';
// ¡Esta importación (con la ruta relativa) es CORRECTA!
import ChatCalculadora from '../components/ChatCalculadora'; 

export default function PresupuestoPage() {
  return (
    <>
      <Cabecera />

      <main className="bg-fondo py-20 px-6">
        <div className="max-w-3xl mx-auto">

          {/* --- ¡AQUÍ ESTÁ EL CAMBIO! --- */}
          {/* Hemos reemplazado el placeholder por el componente real */}
          <ChatCalculadora />

        </div>
      </main>

      <Footer />
    </>
  );
}
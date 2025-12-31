// En: src/app/presupuesto/page.tsx (¡EL CÓDIGO CORREGIDO!)

// 1. ¡Borramos las importaciones de Cabecera y Footer!
// (Ya están en layout.tsx)
import ChatCalculadora from '../components/ChatCalculadora'; 

export default function PresupuestoPage() {
  return (
    // 2. Borramos el Fragment (<>) y los componentes <Cabecera /> y <Footer />
    // Dejamos solo el contenido específico de ESTA página.
    <main className="bg-fondo py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <ChatCalculadora />
      </div>
    </main>
  );
}
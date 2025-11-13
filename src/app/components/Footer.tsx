// En: src/app/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-superficie py-12 px-6 text-center">
      <img 
        src="/images/logo-kiq.svg" 
        alt="Logo KIQ Montajes" 
        className="h-14 mx-auto mb-4" 
      />
      <p className="text-texto-secundario text-sm mb-2">
        Servicio de Montaje de Muebles en Málaga.
      </p>
      <p className="text-texto-secundario text-sm">
        &copy; 2025 KIQ | Todos los derechos reservados.
      </p>
    </footer>
  );
}
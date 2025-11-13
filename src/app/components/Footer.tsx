// En: src/app/components/Footer.tsx
import Image from 'next/image';
export default function Footer() {
  return (
    <footer className="bg-superficie py-12 px-6 text-center">
      <Image 
  src="/images/logo-kiq.svg" 
  alt="Logo KIQ Montajes" 
  width={150}   // 👈 Pon el ancho ORIGINAL de tu SVG (o un valor proporcionaal)
  height={50}  // 👈 Pon el alto ORIGINAL de tu SVG (o un valor proporcional)
  className="h-14 w-auto mx-auto mb-4" // 👈 Añade "w-auto"
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
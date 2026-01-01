'use client';

import { useState, useEffect } from 'react';
import { FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import ProductCard from './ProductCard';
import { useRouter } from 'next/navigation';
// Si usas un hook de autenticación global, impórtalo aquí si quieres lógica condicional, 
// aunque el feed es público.
// import { useUI } from '../context/UIContext'; 

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

// Esta interfaz debe coincidir con lo que devuelve tu backend (/api/outlet/feed)
interface ProductoOutlet {
  id: number;
  titulo: string;
  precio: number;
  imagen: string | null;
  ubicacion: string;
  fecha: string;
  vendedor: { nombre: string; tipo: string; foto: string | null; };
}

export default function KiqOutletSection() {
  const router = useRouter();
  const [productos, setProductos] = useState<ProductoOutlet[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar el Feed desde el Backend
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/outlet/feed`);
        if (res.ok) {
          const data = await res.json();
          // Mostramos solo los 8 más recientes en la Home para no saturar
          setProductos(data.slice(0, 8)); 
        }
      } catch (err) {
        console.error("Error cargando outlet", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Al clicar, llevamos a la página de detalle del producto (que crearemos luego)
  const handleProductClick = (id: number) => {
      router.push(`/producto/${id}`);
  };

  return (
    <section id="outlet-feed" className="py-16 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
                <span className="text-pink-600 font-bold tracking-wider text-xs uppercase mb-2 block">Oportunidades Flash</span>
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    Kiq Outlet <FaShoppingBag className="text-pink-500 text-2xl" />
                </h2>
                <p className="text-gray-500 mt-2 max-w-xl">
                    Muebles recuperados por nuestros montadores profesionales. 
                    <span className="text-indigo-600 font-bold"> Precios de liquidación</span> y disponibilidad inmediata.
                </p>
            </div>
            <button 
                onClick={() => router.push('/outlet')} // En el futuro, a la página completa de outlet
                className="hidden md:flex items-center gap-2 text-gray-600 font-bold hover:text-indigo-600 transition"
            >
                Ver todo <FaArrowRight size={12} />
            </button>
        </div>

        {/* Grid de Productos */}
        {loading ? (
            // Esqueletos de carga
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        ) : productos.length === 0 ? (
            // Estado Vacío
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-bold">No hay ofertas flash ahora mismo.</p>
                <p className="text-xs text-gray-400 mt-1">Nuestros montadores están buscando tesoros...</p>
            </div>
        ) : (
            // Lista de Productos
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {productos.map((prod) => (
                    <div key={prod.id} className="h-[340px]">
                        <ProductCard
                            title={prod.titulo}
                            price={prod.precio}
                            image={prod.imagen}
                            location={prod.ubicacion}
                            sellerName={prod.vendedor.nombre}
                            sellerAvatar={prod.vendedor.foto || undefined}
                            date={prod.fecha}
                            onContact={() => handleProductClick(prod.id)}
                        />
                    </div>
                ))}
            </div>
        )}

        {/* Botón Móvil Ver Todo */}
        <div className="mt-10 text-center md:hidden">
            <button 
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50"
            >
                Ver todas las ofertas
            </button>
        </div>
      </div>
    </section>
  );
}
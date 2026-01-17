'use client';

import { useState, useEffect } from 'react';
import { FaShoppingBag, FaArrowRight, FaTag } from 'react-icons/fa';
import ProductCard from './ProductCard';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

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
          // Mostramos solo los 4 más recientes para no saturar la home
          setProductos(data.slice(0, 4)); 
        }
      } catch (err) {
        console.error("Error cargando outlet", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleProductClick = (id: number) => {
      router.push(`/producto/${id}`);
  };

  const handleVerTodo = () => {
      router.push('/outlet');
  };

  return (
    <section id="outlet-feed" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera de la Sección - Alineada con el estilo Apple */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
                <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-3 flex items-center gap-2">
                    <FaTag /> Oportunidades Flash
                </span>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                    Kiq Outlet
                </h2>
                <p className="text-xl text-gray-600 font-light leading-relaxed">
                    Muebles recuperados por nuestros montadores profesionales. 
                    <strong className="font-semibold text-gray-900"> Calidad verificada</strong> a precios de liquidación.
                </p>
            </div>
            
            <button 
                onClick={handleVerTodo}
                aria-label="Ver todo el catálogo del Outlet"
                className="hidden md:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors group"
            >
                Ver todas las ofertas <FaArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
        </div>

        {/* Grid de Productos */}
        {loading ? (
            // Esqueletos de carga más elegantes
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-80 bg-white rounded-3xl shadow-sm border border-gray-100 animate-pulse"></div>
                ))}
            </div>
        ) : productos.length === 0 ? (
            // Estado Vacío
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <FaShoppingBag className="mx-auto text-gray-300 text-5xl mb-4" />
                <p className="text-gray-900 font-bold text-lg">No hay ofertas flash ahora mismo.</p>
                <p className="text-gray-500 mt-2">Nuestros montadores están buscando tesoros...</p>
            </div>
        ) : (
            // Lista de Productos
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {productos.map((prod) => (
                    <div key={prod.id} className="h-full">
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
        <div className="mt-12 text-center md:hidden">
            <button 
                onClick={handleVerTodo}
                className="w-full py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl shadow-sm hover:bg-gray-50 transition active:scale-95"
            >
                Ver todas las ofertas
            </button>
        </div>
      </div>
    </section>
  );
}
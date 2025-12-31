'use client';
import { useState } from 'react';
import { FaGem, FaCreditCard, FaGift, FaPlay, FaTimes, FaStar, FaVideo } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

interface GemStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    // 👇 CORRECCIÓN: Añadimos estas props como opcionales para que Cabecera.tsx no de error al pasarlas
    onBuyPack?: (packId: string) => void; 
    onWatchAd?: () => void;
}

export default function GemStoreModal({ isOpen, onClose }: GemStoreModalProps) {
    const { accessToken, updateUserGems, userGems } = useUI();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Configuración de Packs (CRÍTICO: Debe coincidir con la de /api/pagos/crear-sesion-gemas)
    const PACKS_CONFIG = {
        'pack_small': { amount: 500, gems: 50, name: 'Puñado de Gemas' },   // 5.00€
        'pack_medium': { amount: 1000, gems: 120, name: 'Bolsa de Gemas' }, // 10.00€
        'pack_large': { amount: 2000, gems: 300, name: 'Cofre de Gemas' }   // 20.00€
    };

    /**
     * CRÍTICO: Llama al backend para crear la sesión de Stripe Checkout y redirige.
     */
    const handleBuyPack = async (packId: keyof typeof PACKS_CONFIG) => {
        if (!accessToken) { 
            setError("Debes iniciar sesión para comprar gemas.");
            return; 
        }
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/pagos/crear-sesion-gemas`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ packId })
            });

            const data = await res.json();

            if (res.ok && data.url) {
                // 1. Redirección a Stripe Checkout (se procesa asíncronamente vía Webhook)
                window.location.href = data.url; 
            } else {
                throw new Error(data.error || 'Error al conectar con Stripe.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    /**
     * Lógica de Simulación para tareas Gratis (onWatchAd)
     */
    const handleWatchAd = () => {
        // En un sistema real, el backend verifica el anuncio y luego actualiza la DB.
        // Aquí actualizamos el Contexto de forma optimista (para fines de demostración)
        updateUserGems(userGems + 20); 
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 h-[80vh] md:h-auto">
            
            {/* Botón Cerrar */}
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20 bg-white rounded-full p-1 shadow-sm">
                <FaTimes size={20} />
            </button>

            {/* COLUMNA IZQUIERDA: TIENDA (PAGO) */}
            <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-8 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <span className="bg-indigo-600 text-white p-2 rounded-lg"><FaCreditCard /></span>
                        Tienda de Gemas
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">Recarga saldo al instante para desbloquear servicios.</p>
                </div>
                
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4 flex-grow overflow-y-auto">
                    {/* Pack Básico */}
                    <button 
                        onClick={() => handleBuyPack('pack_small')}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-500 hover:shadow-md transition flex items-center justify-between group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full group-hover:scale-110 transition">
                                <FaGem size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900">{PACKS_CONFIG.pack_small.gems} Gemas</p>
                                <p className="text-xs text-gray-500">Pack Inicio</p>
                            </div>
                        </div>
                        <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm group-hover:bg-indigo-700">
                            {PACKS_CONFIG.pack_small.amount / 100},00 €
                        </span>
                    </button>

                    {/* Pack Popular */}
                    <button 
                        onClick={() => handleBuyPack('pack_medium')}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-yellow-400 rounded-xl p-4 hover:shadow-lg transition flex items-center justify-between group relative overflow-hidden disabled:opacity-50"
                    >
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            MÁS VENDIDO
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full group-hover:scale-110 transition">
                                <FaGem size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900">{PACKS_CONFIG.pack_medium.gems} Gemas</p>
                                <p className="text-xs text-green-600 font-bold">+20% GRATIS</p>
                            </div>
                        </div>
                        <span className="bg-gray-900 text-white px-4 py-1.5 rounded-lg font-bold text-sm">
                            {PACKS_CONFIG.pack_medium.amount / 100},00 €
                        </span>
                    </button>

                    {/* Pack Pro */}
                    <button 
                        onClick={() => handleBuyPack('pack_large')}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition flex items-center justify-between group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 text-purple-600 p-3 rounded-full group-hover:scale-110 transition">
                                <FaGem size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900">{PACKS_CONFIG.pack_large.gems} Gemas</p>
                                <p className="text-xs text-gray-500">Para profesionales</p>
                            </div>
                        </div>
                        <span className="bg-purple-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm group-hover:bg-purple-700">
                            {PACKS_CONFIG.pack_large.amount / 100},00 €
                        </span>
                    </button>
                </div>
            </div>

            {/* COLUMNA DERECHA: GRATIS (ACCIÓN) */}
            <div className="w-full md:w-1/2 bg-indigo-900 p-6 md:p-8 text-white flex flex-col relative overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-600 rounded-full opacity-30 blur-3xl"></div>

                <div className="relative z-10 mb-6">
                    <h3 className="text-2xl font-black flex items-center gap-2 text-yellow-400">
                        <span className="bg-white/10 p-2 rounded-lg"><FaGift /></span>
                        Gana Gemas Gratis
                    </h3>
                    <p className="text-indigo-200 text-sm mt-2">¿No quieres gastar? Completa tareas sencillas.</p>
                </div>

                <div className="space-y-4 flex-grow relative z-10">
                    {/* Ver Anuncio */}
                    <button 
                        onClick={handleWatchAd}
                        disabled={isLoading}
                        className="w-full bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl p-4 transition flex items-center gap-4 group disabled:opacity-50"
                    >
                        <div className="bg-red-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <FaPlay size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Ver vídeo publicitario</p>
                            <p className="text-xs text-indigo-200">Gana <span className="text-yellow-400 font-bold">+20 Gemas</span> en 30 segundos</p>
                        </div>
                    </button>

                    {/* Invitar Amigo */}
                    <div className="w-full bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl p-4 transition flex items-center gap-4 group cursor-pointer">
                        <div className="bg-green-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <FaGift size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Invita a un amigo</p>
                            <p className="text-xs text-indigo-200">Gana <span className="text-yellow-400 font-bold">+500 Gemas</span> por cada registro</p>
                        </div>
                    </div>

                    {/* Reseña */}
                    <div className="w-full bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl p-4 transition flex items-center gap-4 group cursor-pointer">
                        <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                            <FaStar size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Valora la App</p>
                            <p className="text-xs text-indigo-200">Gana <span className="text-yellow-400 font-bold">+100 Gemas</span> por tu opinión</p>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
    );
}
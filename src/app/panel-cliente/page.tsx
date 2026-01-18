'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  FaCog, FaPlus, FaCheckCircle, FaClipboardList, FaHistory, FaGem, 
  FaCreditCard, FaBoxOpen, FaComments, FaTag, FaMoneyBillWave, FaHourglassHalf, FaShoppingBag 
} from "react-icons/fa";
import { useUI } from '../context/UIContext';
import PaymentModal from '../components/PaymentModal';
import ModalConfirmacion from '@/app/components/ModalConfirmacion';
import PaymentSelectionModal from '../components/PaymentSelectionModal';
import JobCard from '../components/JobCard';
import JobBreakdown from '../components/JobBreakdown';
import ChatModal from '../components/ChatModal'; 
import OrderCard from '../components/OrderCard';
import VenderItemModal from '../components/VenderItemModal';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

// --- INTERFACES BLINDADAS ---
interface ItemDesglose { item: string; cantidad: number; subtotal: number; precio_unitario: number; necesita_anclaje: boolean; }
interface DesgloseDetallado { coste_muebles_base: number; coste_desplazamiento: number; distancia_km: string; coste_anclaje_estimado: number; total_extras: number; muebles_cotizados: ItemDesglose[]; }

interface EtiquetasTrabajo {
    tipo?: string;
    [key: string]: any;
}

interface TrabajoCliente {
    trabajo_id: number;
    descripcion: string;
    direccion: string;
    estado: string; 
    precio_calculado: number;
    fecha_creacion: string;
    montador_id: number | null;
    montador_info?: { nombre: string; telefono: string; foto_url?: string; }; 
    payment_intent_id?: string;
    imagenes_urls?: string[];
    foto_finalizacion?: string;
    desglose?: DesgloseDetallado;
    metodo_pago?: string;
    etiquetas?: EtiquetasTrabajo;
}

interface Order {
    order_id: number;
    fecha: string;
    estado_pedido: string;
    total: number;
    metodo_pago: string;
    producto: { id: number; titulo: string; imagen: string | null; ubicacion: string; };
}

interface MyProduct {
    id: number;
    titulo: string;
    precio: number;
    estado: 'disponible' | 'reservado' | 'vendido';
    imagen: string | null;
    fecha: string;
}

// ------------------------------------------------------------------
// COMPONENTE INTERNO
// ------------------------------------------------------------------
function ContenidoPanelCliente() {
    const { userProfile, accessToken, handleLogout, openCalculatorModal, userGems, openGemStore } = useUI();
    const router = useRouter();
    const searchParams = useSearchParams(); 
    
    // --- ESTADOS ---
    const [trabajos, setTrabajos] = useState<TrabajoCliente[]>([]);
    const [pedidos, setPedidos] = useState<Order[]>([]);
    const [misProductos, setMisProductos] = useState<MyProduct[]>([]); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'proyectos' | 'pedidos' | 'ventas' | 'historial'>('proyectos');
    
    // Estados Modales
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [selectedJobForPayment, setSelectedJobForPayment] = useState<TrabajoCliente | null>(null);
    const [chatJobId, setChatJobId] = useState<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isVenderModalOpen, setIsVenderModalOpen] = useState(false);

    const trabajoChatActivo = trabajos.find(t => t.trabajo_id === chatJobId);

    const [modalInfo, setModalInfo] = useState({
        isOpen: false,
        type: 'info' as 'info' | 'danger' | 'success',
        title: '',
        message: '',
        confirmText: 'Aceptar',
        onConfirm: undefined as (() => void) | undefined,
    });

    const cerrarModal = () => setModalInfo(prev => ({ ...prev, isOpen: false }));
    const navigate = (path: string) => router.push(path);

    // --- FETCH DATA ---
    const fetchAllData = useCallback(async () => {
        if (!accessToken) return;
        try {
            const headers = { 'Authorization': `Bearer ${accessToken}`, 'Cache-Control': 'no-cache' };
            
            const [resTrabajos, resPedidos, resProductos] = await Promise.all([
                fetch(`${API_BASE_URL}/api/cliente/mis-trabajos`, { headers }),
                fetch(`${API_BASE_URL}/api/orders/mis-compras`, { headers }),
                fetch(`${API_BASE_URL}/api/outlet/mis-productos`, { headers })
            ]);

            if (resTrabajos.status === 401) { handleLogout(); return; }

            setTrabajos(resTrabajos.ok ? await resTrabajos.json() : []);
            setPedidos(resPedidos.ok ? await resPedidos.json() : []);
            setMisProductos(resProductos.ok ? await resProductos.json() : []);

        } catch (err: any) { 
            console.error("Error fetching data:", err);
        }
    }, [accessToken, handleLogout]);

    useEffect(() => { 
        if (userProfile?.tipo === 'cliente') {
            setIsLoading(true);
            fetchAllData().finally(() => setIsLoading(false));
            if (searchParams.get('tab') === 'outlet') router.push('/');
        } else if (!accessToken) {
             setIsLoading(false);
        } else if (userProfile && userProfile.tipo === 'montador') { 
            navigate('/panel-montador');
        }
    }, [fetchAllData, userProfile, accessToken]);

    // --- LÓGICA DEEP LINKING (Chat) ---
    useEffect(() => {
        const gestionarIntencion = async () => {
            if (!accessToken || !userProfile) return;

            const chatParam = searchParams.get('chat');
            if (chatParam) {
                const id = parseInt(chatParam);
                if (!isNaN(id)) {
                    setChatJobId(id); setIsChatOpen(true);
                    router.replace('/panel-cliente', { scroll: false });
                    return; 
                }
            }

            const accion = searchParams.get('accion');
            const productoId = searchParams.get('producto');
            const intencionPago = searchParams.get('intencion_pago');

            if (accion === 'nuevo_chat' && productoId) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/outlet/iniciar-chat`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ producto_id: productoId, intencion_inicial: intencionPago })
                    });
                    const data = await res.json();
                    
                    if (res.ok && data.job_id) {
                        await fetchAllData(); 
                        setChatJobId(data.job_id);
                        setIsChatOpen(true);
                        setActiveTab('pedidos'); 
                        router.replace('/panel-cliente', { scroll: false });
                    }
                } catch (e) { console.error(e); }
            }
        };

        if (!isLoading) gestionarIntencion();
    }, [searchParams, accessToken, userProfile, isLoading, router, fetchAllData]);

    // --- ACCIONES UI ---
    const abrirChat = (trabajo: TrabajoCliente) => { setChatJobId(trabajo.trabajo_id); setIsChatOpen(true); };
    const contactarVendedorPedido = async (productoId: number) => { router.push(`/panel-cliente?accion=nuevo_chat&producto=${productoId}`); };
    const abrirSelectorPago = (t: TrabajoCliente) => { setSelectedJobForPayment(t); setIsSelectionModalOpen(true); };
    
    // --- ACCIONES API (Pagos, Cancelar, Confirmar) ---
    const handleIniciarPagoStripe = async () => { 
         setIsSelectionModalOpen(false);
         if (!selectedJobForPayment || !accessToken) return;
         try {
            const res = await fetch(`${API_BASE_URL}/api/cliente/crear-payment-intent`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ precio_calculado: selectedJobForPayment.precio_calculado })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setClientSecret(data.client_secret);
            setPaymentModalOpen(true);
        } catch (err: any) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: err.message, confirmText: 'Cerrar', onConfirm: undefined }); }
    };

    const handlePagoEfectivo = async () => { 
         setIsSelectionModalOpen(false);
         if (!selectedJobForPayment || !accessToken) return;
         try {
            const res = await fetch(`${API_BASE_URL}/api/cliente/trabajo/${selectedJobForPayment.trabajo_id}/pagar-con-gemas`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: data.error || 'No se pudo confirmar.', confirmText: 'Cerrar', onConfirm: undefined }); return; }
            fetchAllData(); 
            setModalInfo({ isOpen: true, type: 'success', title: '¡Reserva Confirmada!', message: `Pagarás ${selectedJobForPayment.precio_calculado}€ en mano.`, confirmText: 'Entendido', onConfirm: undefined });
            setSelectedJobForPayment(null);
        } catch (err: any) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: 'No se pudo conectar.', confirmText: 'Cerrar', onConfirm: undefined }); }
    };

    const handlePaymentSuccess = async (pid: string) => {
         if (!accessToken || !selectedJobForPayment) return;
         try {
            const res = await fetch(`${API_BASE_URL}/api/cliente/trabajo/${selectedJobForPayment.trabajo_id}/activar`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_intent_id: pid })
            });
            if (!res.ok) throw new Error('Error');
            fetchAllData(); setPaymentModalOpen(false); setSelectedJobForPayment(null);
            setModalInfo({ isOpen: true, type: 'success', title: '¡Pago Correcto!', message: 'Transacción activa.', confirmText: 'Genial', onConfirm: undefined });
        } catch (err: any) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: err.message, confirmText: 'Cerrar', onConfirm: undefined }); }
    };

    const ejecutarConfirmarPago = async (tid: number) => { 
         if (!accessToken) return;
         try {
            const res = await fetch(`${API_BASE_URL}/api/cliente/trabajo/${tid}/confirmar-pago`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error('Error');
            fetchAllData();
            setModalInfo({ isOpen: true, type: 'success', title: '¡Finalizado!', message: 'Gracias por tu compra.', confirmText: 'Cerrar', onConfirm: undefined });
        } catch (err: any) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: err.message, confirmText: 'Cerrar', onConfirm: undefined }); }
    };

    const ejecutarCancelarTrabajo = async (tid: number) => { 
         if (!accessToken) return;
         try {
            const res = await fetch(`${API_BASE_URL}/api/cliente/trabajo/${tid}/cancelar`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
            if (res.ok) { fetchAllData(); setModalInfo({ isOpen: true, type: 'info', title: 'Cancelado', message: 'Operación cancelada.', confirmText: 'Cerrar', onConfirm: undefined }); }
         } catch (e: any) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: e.message, confirmText: 'Cerrar', onConfirm: undefined }); }
    };

    const solicitarConfirmacionFinal = (id: number) => setModalInfo({ isOpen: true, type: 'success', title: '¿Confirmar Recepción?', message: 'Al aceptar, confirmas que tienes el producto.', confirmText: 'Sí, recibido', onConfirm: () => ejecutarConfirmarPago(id) });
    const solicitarCancelacion = (id: number) => setModalInfo({ isOpen: true, type: 'danger', title: '¿Cancelar?', message: '¿Seguro?', confirmText: 'Sí', onConfirm: () => ejecutarCancelarTrabajo(id) });

    // --- FILTRADO SEGURO ---
    const activos = ['cotizacion', 'pendiente', 'aceptado', 'revision_cliente', 'aprobado_cliente_stripe', 'cancelado_incidencia'];
    const finalizados = ['completado', 'cancelado', 'finalizado', 'rechazado', 'vendido']; 

    const trabajosProyectos = trabajos.filter(t => 
        activos.includes(t.estado) && 
        t.etiquetas?.tipo !== 'outlet' 
    );

    const comprasEnCurso = trabajos.filter(t => 
        activos.includes(t.estado) && 
        t.etiquetas?.tipo === 'outlet'
    );

    const trabajosHistorial = trabajos.filter(t => finalizados.includes(t.estado));

    const getStatusInfo = (estado: string) => {
         switch (estado) {
            case 'cotizacion': return { label: 'Borrador', color: 'bg-gray-100 text-gray-600 border-gray-200' };
            case 'pendiente': return { label: 'Reservado / Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
            case 'aceptado': return { label: 'Negociando', color: 'bg-blue-100 text-blue-800 border-blue-200' };
            case 'revision_cliente': return { label: 'Confirmar Entrega', color: 'bg-purple-100 text-purple-800 border-purple-200 ring-1 ring-purple-300' };
            case 'aprobado_cliente_stripe': return { label: 'Pago Retenido', color: 'bg-yellow-500 text-white border-yellow-600' };
            case 'completado': return { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-200' };
            default: return { label: estado, color: 'bg-gray-50 text-gray-600' };
        }
    };

    const getProductStatus = (estado: string) => {
        switch(estado) {
            case 'disponible': return { label: 'En Venta', color: 'bg-emerald-100 text-emerald-700' };
            case 'reservado': return { label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' };
            case 'vendido': return { label: 'Vendido', color: 'bg-gray-100 text-gray-600 line-through opacity-75' };
            default: return { label: estado, color: 'bg-gray-50 text-gray-500' };
        }
    }

    if (isLoading || !userProfile) return <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
    
    const perfil = userProfile;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
                
                {/* --- HEADER PREMIUM --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hola, <span className="text-indigo-600">{perfil.nombre}</span> 👋</h1>
                        <p className="text-slate-500 text-sm mt-1">Gestiona tus proyectos y compras desde aquí.</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-indigo-700 font-bold text-sm">
                            <FaGem className="text-indigo-500"/> {userGems}
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={() => navigate('/panel-cliente/configuracion')} aria-label="Configuración" className="p-2.5 bg-white rounded-full text-slate-400 border border-gray-100 hover:border-indigo-100 hover:text-indigo-600 hover:shadow-md transition-all">
                                <FaCog size={18} />
                            </button>
                            <button onClick={() => setIsVenderModalOpen(true)} aria-label="Vender artículo" className="p-2.5 bg-white rounded-full text-slate-400 border border-gray-100 hover:border-yellow-200 hover:text-yellow-600 hover:shadow-md transition-all">
                                <FaTag size={18} />
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => openCalculatorModal('lite')} 
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <FaPlus className="mb-0.5"/> Nuevo Proyecto
                        </button>
                    </div>
                </div>

                {/* --- PESTAÑAS (TABS) PREMIUM --- */}
                <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar justify-start md:justify-center">
                    {[
                        { id: 'proyectos', label: 'Proyectos', icon: FaClipboardList },
                        { id: 'pedidos', label: 'Compras', icon: FaShoppingBag },
                        { id: 'ventas', label: 'Ventas', icon: FaTag },
                        { id: 'historial', label: 'Historial', icon: FaHistory },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md transform scale-105'
                                    : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            <tab.icon className={activeTab === tab.id ? 'text-indigo-400' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- CONTENIDO DINÁMICO --- */}

                {/* A. PESTAÑA PEDIDOS (OUTLET) */}
                {activeTab === 'pedidos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {comprasEnCurso.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FaHourglassHalf /> En Proceso ({comprasEnCurso.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {comprasEnCurso.map((trabajo) => {
                                        const status = getStatusInfo(trabajo.estado);
                                        return (
                                            <JobCard
                                                key={trabajo.trabajo_id}
                                                title={trabajo.descripcion}
                                                price={trabajo.precio_calculado}
                                                date={new Date(trabajo.fecha_creacion).toLocaleDateString()}
                                                location={trabajo.direccion}
                                                imageUrl={trabajo.imagenes_urls?.[0]}
                                                statusLabel={status.label}
                                                statusColorClass={status.color}
                                                onImageClick={() => trabajo.imagenes_urls?.[0] && window.open(trabajo.imagenes_urls[0], '_blank')}
                                            >
                                                <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-50">
                                                    <button onClick={() => abrirChat(trabajo)} className="flex-1 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition text-sm flex items-center justify-center gap-2"><FaComments /> Chat</button>
                                                    {trabajo.estado === 'revision_cliente' && (
                                                        <button onClick={() => solicitarConfirmacionFinal(trabajo.trabajo_id)} className="flex-1 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition text-sm flex items-center justify-center gap-2"><FaCheckCircle /> Confirmar Recibido</button>
                                                    )}
                                                    {trabajo.estado === 'cotizacion' && (
                                                        <button onClick={() => abrirSelectorPago(trabajo)} className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition text-sm flex items-center justify-center gap-2">Pagar Ahora</button>
                                                    )}
                                                    <button onClick={() => solicitarCancelacion(trabajo.trabajo_id)} className="px-3 py-2 text-red-400 font-bold text-xs hover:bg-red-50 rounded-xl transition">Cancelar</button>
                                                </div>
                                            </JobCard>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {pedidos.length > 0 && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historial de Compras</h3>}
                            {pedidos.length === 0 && comprasEnCurso.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaBoxOpen className="text-slate-300 text-2xl" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No has realizado ninguna compra aún.</p>
                                    <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 font-bold hover:underline">Ir al Outlet</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pedidos.map((pedido) => (
                                        <OrderCard
                                            key={pedido.order_id}
                                            orderId={pedido.order_id}
                                            date={pedido.fecha}
                                            total={pedido.total}
                                            status={pedido.estado_pedido}
                                            productTitle={pedido.producto.titulo}
                                            productImage={pedido.producto.imagen || undefined}
                                            onContactSeller={() => contactarVendedorPedido(pedido.producto.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* B. PESTAÑA PROYECTOS (SERVICIOS) */}
                {activeTab === 'proyectos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {trabajosProyectos.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaClipboardList className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-500 font-medium">No tienes proyectos de montaje activos.</p>
                                <button onClick={() => openCalculatorModal('lite')} className="mt-4 text-indigo-600 font-bold hover:underline">Pedir Presupuesto</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trabajosProyectos.map(trabajo => {
                                    const status = getStatusInfo(trabajo.estado);
                                    return (
                                        <JobCard
                                            key={trabajo.trabajo_id}
                                            title={trabajo.descripcion}
                                            price={trabajo.precio_calculado}
                                            date={new Date(trabajo.fecha_creacion).toLocaleDateString()}
                                            location={trabajo.direccion}
                                            imageUrl={trabajo.imagenes_urls?.[0]}
                                            statusLabel={status.label}
                                            statusColorClass={status.color}
                                            onChatClick={trabajo.estado !== 'cotizacion' ? () => abrirChat(trabajo) : undefined}
                                        >
                                            {trabajo.desglose && <JobBreakdown desglose={trabajo.desglose} precioFinal={trabajo.precio_calculado} modo="total" />}
                                            <div className="mt-4 flex flex-col gap-3">
                                                {trabajo.estado === 'cotizacion' && (
                                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                                        <p className="text-xs text-yellow-800 font-bold mb-2 text-center uppercase tracking-wide">
                                                            ⚠️ Pendiente de confirmación
                                                        </p>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); abrirSelectorPago(trabajo); }}
                                                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <FaCreditCard /> Confirmar y Pagar
                                                        </button>
                                                    </div>
                                                )}
                                                {trabajo.estado === 'revision_cliente' && (
                                                    <button 
                                                        onClick={() => solicitarConfirmacionFinal(trabajo.trabajo_id)} 
                                                        className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        <FaCheckCircle /> Confirmar Trabajo Finalizado
                                                    </button>
                                                )}
                                                <div className="flex justify-end pt-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); solicitarCancelacion(trabajo.trabajo_id); }} 
                                                        className="text-xs text-red-400 font-bold hover:text-red-600 hover:underline transition"
                                                    >
                                                        Cancelar Proyecto
                                                    </button>
                                                </div>
                                            </div>
                                        </JobCard>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* C. PESTAÑA VENTAS */}
                {activeTab === 'ventas' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {misProductos.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaTag className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-500 font-medium">No tienes productos en venta.</p>
                                <button onClick={() => setIsVenderModalOpen(true)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition">¡Vender mi primer artículo!</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {misProductos.map((prod) => {
                                    const st = getProductStatus(prod.estado);
                                    return (
                                        <JobCard
                                            key={prod.id}
                                            title={prod.titulo}
                                            price={prod.precio}
                                            date={new Date(prod.fecha).toLocaleDateString()}
                                            location="Tu Almacén"
                                            imageUrl={prod.imagen || undefined}
                                            statusLabel={st.label}
                                            statusColorClass={st.color}
                                            onImageClick={() => router.push(`/producto/${prod.id}`)}
                                        >
                                            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1 font-medium">
                                                <FaTag className="text-indigo-400"/> Producto en venta
                                            </div>
                                        </JobCard>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* D. HISTORIAL */}
                {activeTab === 'historial' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {trabajosHistorial.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaHistory className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-500">Tu historial está vacío.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trabajosHistorial.map(trabajo => (
                                    <JobCard
                                        key={trabajo.trabajo_id}
                                        title={trabajo.descripcion}
                                        price={trabajo.precio_calculado}
                                        date={new Date(trabajo.fecha_creacion).toLocaleDateString()}
                                        location={trabajo.direccion}
                                        imageUrl={trabajo.imagenes_urls?.[0]}
                                        statusLabel={getStatusInfo(trabajo.estado).label}
                                        statusColorClass={getStatusInfo(trabajo.estado).color}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Modales */}
                <ChatModal isOpen={isChatOpen} onClose={() => { setIsChatOpen(false); setChatJobId(null); }} jobId={chatJobId} currentUserId={perfil.id.toString()} currentUserRole="cliente" jobTitle={`Chat de Trabajo #${chatJobId}`} myAvatar={perfil.foto_url || undefined} otherAvatar={trabajoChatActivo?.montador_info?.foto_url || undefined} otherName={trabajoChatActivo?.montador_info?.nombre} />
                {isSelectionModalOpen && selectedJobForPayment && <PaymentSelectionModal isOpen={isSelectionModalOpen} onClose={() => setIsSelectionModalOpen(false)} onSelectStripe={handleIniciarPagoStripe} onSelectGems={handlePagoEfectivo} onConseguirGemas={openGemStore} precio={selectedJobForPayment.precio_calculado} saldoGemas={userGems} costeGemas={0} esPrimerTrabajo={false} />}
                {isPaymentModalOpen && clientSecret && <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} clientSecret={clientSecret} amount={selectedJobForPayment?.precio_calculado || 0} clientName={userProfile.nombre} onPaymentSuccess={handlePaymentSuccess} />}
                <VenderItemModal isOpen={isVenderModalOpen} onClose={() => setIsVenderModalOpen(false)} onSuccess={() => { alert("¡Publicado! Pronto aparecerá en el feed."); fetchAllData(); }} />
                <ModalConfirmacion isOpen={modalInfo.isOpen} onClose={cerrarModal} onConfirm={modalInfo.onConfirm} title={modalInfo.title} message={modalInfo.message} type={modalInfo.type} confirmText={modalInfo.confirmText} />
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
export default function PanelClientePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
      <ContenidoPanelCliente />
    </Suspense>
  );
}
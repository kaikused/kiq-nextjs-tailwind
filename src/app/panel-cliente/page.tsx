'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'; // 👈 Añadido Suspense
import { 
  FaCog, 
  FaPlus, 
  FaCheckCircle, 
  FaClipboardList, 
  FaHistory, 
  FaChevronRight, 
  FaGem, 
  FaCreditCard, 
  FaShoppingBag, 
  FaBoxOpen, 
  FaTruck, 
  FaComments,
  FaSearch,
  FaTag,            // 🆕 Icono para ventas
  FaMoneyBillWave,  // 🆕 Icono para gestión
  FaHourglassHalf   // 🆕 Icono para 'En Proceso'
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

// --- INTERFACES ---
interface ItemDesglose { item: string; cantidad: number; subtotal: number; precio_unitario: number; necesita_anclaje: boolean; }
interface DesgloseDetallado { coste_muebles_base: number; coste_desplazamiento: number; distancia_km: string; coste_anclaje_estimado: number; total_extras: number; muebles_cotizados: ItemDesglose[]; }

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
    etiquetas?: any; 
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
// COMPONENTE INTERNO (Lógica con useSearchParams)
// ------------------------------------------------------------------
function ContenidoPanelCliente() {
    const { userProfile, accessToken, handleLogout, openCalculatorModal, userGems, openGemStore } = useUI();
    const router = useRouter();
    const searchParams = useSearchParams(); // 👈 Esto es lo que causaba el error sin Suspense
    
    // --- ESTADOS DE DATOS ---
    const [trabajos, setTrabajos] = useState<TrabajoCliente[]>([]);
    const [pedidos, setPedidos] = useState<Order[]>([]);
    const [misProductos, setMisProductos] = useState<MyProduct[]>([]); 
    
    const [isLoading, setIsLoading] = useState(true);
    
    // Pestañas actualizadas
    const [activeTab, setActiveTab] = useState<'proyectos' | 'pedidos' | 'ventas' | 'historial'>('proyectos');
    
    // Estados de Pago
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [selectedJobForPayment, setSelectedJobForPayment] = useState<TrabajoCliente | null>(null);

    // Estados Chat
    const [chatJobId, setChatJobId] = useState<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const trabajoChatActivo = trabajos.find(t => t.trabajo_id === chatJobId);

    // 🆕 Estado Modal Vender
    const [isVenderModalOpen, setIsVenderModalOpen] = useState(false);

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

    // --- 1. FETCH DATA UNIFICADO ---
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

        } catch (err: any) { console.error("Error fetching data:", err); }
    }, [accessToken, handleLogout]);

    // Carga Inicial
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

    // --- LÓGICA AUTO-APERTURA CHAT ---
    useEffect(() => {
        const gestionarIntencion = async () => {
            if (!accessToken || !userProfile) return;

            // Caso A: Abrir chat existente por ID
            const chatParam = searchParams.get('chat');
            if (chatParam) {
                const id = parseInt(chatParam);
                if (!isNaN(id)) {
                    setChatJobId(id); setIsChatOpen(true);
                    router.replace('/panel-cliente', { scroll: false });
                    return; 
                }
            }

            // Caso B: Crear nuevo chat desde Outlet
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

    // --- LÓGICA DE PAGOS ---
    const abrirSelectorPago = (t: TrabajoCliente) => { setSelectedJobForPayment(t); setIsSelectionModalOpen(true); };
    
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


    // --- 🚨 LÓGICA DE FILTRADO CORRECTA 🚨 ---
    const activos = ['cotizacion', 'pendiente', 'aceptado', 'revision_cliente', 'aprobado_cliente_stripe', 'cancelado_incidencia'];
    const finalizados = ['completado', 'cancelado', 'finalizado', 'rechazado', 'vendido']; 

    const trabajosProyectos = trabajos.filter(t => 
        activos.includes(t.estado) && 
        (!t.etiquetas || (t.etiquetas as any).tipo !== 'outlet') 
    );

    const comprasEnCurso = trabajos.filter(t => 
        activos.includes(t.estado) && 
        (t.etiquetas && (t.etiquetas as any).tipo === 'outlet')
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

    if (isLoading || !userProfile) return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
    const perfil = userProfile;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24">
            <div className="max-w-5xl mx-auto py-8 px-5">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Hola, <span className="text-indigo-600">{perfil.nombre.split(' ')[0]}</span> 👋</h1>
                        <p className="text-gray-500 text-sm">Tu espacio personal</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-bold text-sm mr-2"><FaGem className="text-indigo-500"/> {userGems}</div>
                        <button onClick={() => navigate('/panel-cliente/configuracion')} className="p-2.5 bg-white rounded-full text-gray-500 shadow-sm hover:text-indigo-600 transition"><FaCog size={18} /></button>
                        {/* Botón Vender */}
                        <button onClick={() => setIsVenderModalOpen(true)} className="p-2.5 bg-yellow-100 text-yellow-700 rounded-full shadow-sm hover:bg-yellow-200 transition"><FaTag size={18} /></button>
                        <button onClick={() => openCalculatorModal('lite')} className="bg-indigo-600 text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"><FaPlus className="mb-0.5"/> Nuevo Proyecto</button>
                    </div>
                </div>

                {/* --- PESTAÑAS VISUALES --- */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 py-2 mb-8">
                    <button onClick={() => setActiveTab('proyectos')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${activeTab === 'proyectos' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}>
                        <FaClipboardList className={`text-2xl ${activeTab === 'proyectos' ? 'text-indigo-600' : 'inherit'}`} /><span className={`text-sm font-bold ${activeTab === 'proyectos' ? 'text-indigo-600' : 'inherit'}`}>Mis Proyectos</span>
                    </button>
                    <button onClick={() => setActiveTab('pedidos')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${activeTab === 'pedidos' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}>
                        <FaBoxOpen className={`text-2xl ${activeTab === 'pedidos' ? 'text-pink-500' : 'inherit'}`} /><span className={`text-sm font-bold ${activeTab === 'pedidos' ? 'text-pink-500' : 'inherit'}`}>Mis Compras</span>
                    </button>
                    <button onClick={() => setActiveTab('ventas')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${activeTab === 'ventas' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}>
                        <FaTag className={`text-2xl ${activeTab === 'ventas' ? 'text-green-600' : 'inherit'}`} /><span className={`text-sm font-bold ${activeTab === 'ventas' ? 'text-green-600' : 'inherit'}`}>Mis Ventas</span>
                    </button>
                    <button onClick={() => setActiveTab('historial')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${activeTab === 'historial' ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}>
                        <FaHistory className={`text-2xl ${activeTab === 'historial' ? 'text-indigo-600' : 'inherit'}`} /><span className={`text-sm font-bold ${activeTab === 'historial' ? 'text-indigo-600' : 'inherit'}`}>Historial</span>
                    </button>
                </div>

                {/* --- CONTENIDO --- */}

                {/* A. PESTAÑA PEDIDOS (AQUÍ ESTÁ LA MAGIA) */}
                {activeTab === 'pedidos' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        
                        {/* 1. SECCIÓN: COMPRAS EN CURSO (Recuperadas del limbo) */}
                        {comprasEnCurso.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <FaHourglassHalf /> Compras en Proceso ({comprasEnCurso.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {comprasEnCurso.map((trabajo) => {
                                        const status = getStatusInfo(trabajo.estado);
                                        // Usamos JobCard porque técnicamente es un trabajo (tiene chat, estado, etc.)
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
                                                {/* BOTONES DE ACCIÓN PARA COMPLETAR LA COMPRA */}
                                                <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-50">
                                                    <button onClick={() => abrirChat(trabajo)} className="flex-1 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition text-sm flex items-center justify-center gap-2"><FaComments /> Chat</button>
                                                    
                                                    {trabajo.estado === 'revision_cliente' && (
                                                        <button onClick={() => solicitarConfirmacionFinal(trabajo.trabajo_id)} className="flex-1 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition text-sm flex items-center justify-center gap-2"><FaCheckCircle /> Confirmar Recibido</button>
                                                    )}
                                                    
                                                    {trabajo.estado === 'cotizacion' && (
                                                        <button onClick={() => abrirSelectorPago(trabajo)} className="flex-1 py-2 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition text-sm flex items-center justify-center gap-2">Pagar Ahora</button>
                                                    )}

                                                    <button onClick={() => solicitarCancelacion(trabajo.trabajo_id)} className="px-3 py-2 text-red-400 font-bold text-xs hover:bg-red-50 rounded-xl transition">Cancelar</button>
                                                </div>
                                            </JobCard>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. SECCIÓN: PEDIDOS FINALIZADOS (Historial) */}
                        <div className="space-y-4">
                            {pedidos.length > 0 && <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Historial de Recibos</h3>}
                            {pedidos.length === 0 && comprasEnCurso.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <FaBoxOpen className="mx-auto text-gray-300 text-4xl mb-3" />
                                    <p className="text-gray-500 font-medium">Aún no has comprado nada.</p>
                                    <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 font-bold hover:underline">Explorar ofertas en el Outlet</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* B. PESTAÑA PROYECTOS (SOLO MONTAJES) */}
                {activeTab === 'proyectos' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {trabajosProyectos.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                <FaClipboardList className="mx-auto text-gray-300 text-4xl mb-3" />
                                <p className="text-gray-500">No tienes proyectos de montaje activos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trabajosProyectos.map(trabajo => {
                                    const status = getStatusInfo(trabajo.estado);
                                    // Renderizado normal de JobCard para servicios
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
                                            onChatClick={() => abrirChat(trabajo)}
                                        >
                                            {trabajo.desglose && <JobBreakdown desglose={trabajo.desglose} precioFinal={trabajo.precio_calculado} modo="total" />}
                                            <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-50">
                                                <button onClick={() => solicitarCancelacion(trabajo.trabajo_id)} className="text-xs text-red-400 underline">Cancelar Proyecto</button>
                                            </div>
                                        </JobCard>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* C. PESTAÑA MIS VENTAS (TU INVENTARIO) */}
                {activeTab === 'ventas' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        {misProductos.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                <FaTag className="mx-auto text-gray-300 text-4xl mb-3" />
                                <p className="text-gray-500 font-medium">No tienes productos en venta.</p>
                                <button onClick={() => setIsVenderModalOpen(true)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition">¡Vender mi primer artículo!</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {misProductos.map((prod) => (
                                    <JobCard
                                        key={prod.id}
                                        title={prod.titulo}
                                        price={prod.precio}
                                        date={new Date(prod.fecha).toLocaleDateString()}
                                        location="Tu Inventario"
                                        imageUrl={prod.imagen || undefined}
                                        statusLabel={getProductStatus(prod.estado).label}
                                        statusColorClass={getProductStatus(prod.estado).color}
                                        onImageClick={() => router.push(`/producto/${prod.id}`)}
                                    >
                                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1"><FaMoneyBillWave/> Gestiona este producto</div>
                                    </JobCard>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* D. HISTORIAL */}
                {activeTab === 'historial' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {trabajosHistorial.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                <FaHistory className="mx-auto text-gray-300 text-4xl mb-3" />
                                <p className="text-gray-500">No hay historial.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
// COMPONENTE PRINCIPAL (Wrapper con Suspense para Build Correcto)
// ------------------------------------------------------------------
export default function PanelClientePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Cargando panel...</div>}>
      <ContenidoPanelCliente />
    </Suspense>
  );
}
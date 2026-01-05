'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'; 
import { 
  FaCreditCard, 
  FaCamera, 
  FaSearch, 
  FaClipboardList, 
  FaHistory, 
  FaGem, 
  FaPlus, 
  FaCheckCircle, 
  FaChevronRight, 
  FaGift, 
  FaCommentDots, 
  FaTag, 
  FaMoneyBillWave,
  FaTrash
} from "react-icons/fa"; 
import ModalConfirmacion from '../components/ModalConfirmacion';
import JobCard from '../components/JobCard';
import JobBreakdown from '../components/JobBreakdown';
import ChatModal from '../components/ChatModal';
import WelcomeBonusModal from '../components/WelcomeBonusModal';
import VenderItemModal from '../components/VenderItemModal';
import { useUI } from '../context/UIContext';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

// --- INTERFACES ---
interface ItemDesglose { item: string; cantidad: number; precio_unitario: number; subtotal: number; necesita_anclaje: boolean; }
interface DesgloseDetallado { coste_muebles_base: number; coste_desplazamiento: number; distancia_km: string; coste_anclaje_estimado: number; total_extras: number; muebles_cotizados: ItemDesglose[]; }

interface TrabajoMontador { 
    trabajo_id: number; 
    descripcion: string; 
    direccion: string; 
    precio_calculado: number; 
    fecha_creacion: string; 
    cliente_nombre: string; 
    // 🔥 ACTUALIZADO: Añadido el campo telefono aquí
    cliente_info?: { 
        nombre: string; 
        foto_url?: string; 
        telefono?: string; 
    }; 
    estado: string; 
    imagenes_urls?: string[]; 
    etiquetas?: any; 
    desglose?: DesgloseDetallado; 
    metodo_pago?: string; 
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
// COMPONENTE INTERNO (Lógica del panel)
// ------------------------------------------------------------------
function ContenidoPanelMontador() {
    const { userGems, openGemStore, userProfile, accessToken, handleLogout, updateProfileData } = useUI(); 
    const router = useRouter();
    const searchParams = useSearchParams(); 

    // Estados de Datos
    const [trabajosDisponibles, setTrabajosDisponibles] = useState<TrabajoMontador[]>([]);
    const [misTrabajosAsignados, setMisTrabajosAsignados] = useState<TrabajoMontador[]>([]);
    const [misProductos, setMisProductos] = useState<MyProduct[]>([]); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isStripeLoading, setIsStripeLoading] = useState(false);
    
    // Estados Chat
    const [chatJobId, setChatJobId] = useState<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Estado Modal Bienvenida
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Estado Modal Venta
    const [isVenderModalOpen, setIsVenderModalOpen] = useState(false);

    // UI States
    const [activeTab, setActiveTab] = useState<'disponibles' | 'activos' | 'ventas' | 'historial'>('disponibles');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedJobIdForUpload, setSelectedJobIdForUpload] = useState<number | null>(null);
    
    const [modalInfo, setModalInfo] = useState({
        isOpen: false,
        type: 'info' as 'info' | 'danger' | 'success',
        title: '',
        message: '',
        confirmText: 'Aceptar',
        onConfirm: undefined as (() => void) | undefined,
    });

    const trabajoChatActivo = misTrabajosAsignados.find(t => t.trabajo_id === chatJobId);
    const cerrarModal = () => setModalInfo(prev => ({ ...prev, isOpen: false }));
    const navigate = (path: string) => router.push(path);

    // Lógica de Auto-Apertura Chat
    useEffect(() => {
        const chatParam = searchParams.get('chat');
        if (chatParam) {
            const id = parseInt(chatParam);
            if (!isNaN(id)) {
                setChatJobId(id);
                setIsChatOpen(true);
                router.replace('/panel-montador', { scroll: false }); 
            }
        }
    }, [searchParams, router]);

    // --- FETCH DATA (INTEGRADO) ---
    const fetchData = useCallback(async () => {
        if (!accessToken) { handleLogout(); navigate('/acceso'); return; }

        try {
            const headers = { 'Authorization': `Bearer ${accessToken}`, 'Cache-Control': 'no-cache' };
            
            // 1. Cargar Trabajos
            const [resDisponibles, resAsignados] = await Promise.all([
                fetch(`${API_BASE_URL}/api/montador/trabajos/disponibles?t=${Date.now()}`, { headers }),
                fetch(`${API_BASE_URL}/api/montador/mis-trabajos?t=${Date.now()}`, { headers }),
            ]);

            if (resDisponibles.status === 401 || resAsignados.status === 401) { handleLogout(); return; }
            
            setTrabajosDisponibles(await resDisponibles.json());
            setMisTrabajosAsignados(await resAsignados.json());

            // 2. Cargar Mis Productos (INVENTARIO)
            try {
                const resProds = await fetch(`${API_BASE_URL}/api/outlet/mis-productos`, { headers });
                if (resProds.ok) {
                    setMisProductos(await resProds.json());
                }
            } catch (e) {
                console.error("Error cargando inventario", e);
            }

            // Auto-navegación inteligente
            if (!searchParams.get('chat') && misTrabajosAsignados.some(t => ['aceptado', 'revision_cliente'].includes(t.estado))) {
                setActiveTab('activos');
            }

        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    }, [accessToken, handleLogout, searchParams]);

    useEffect(() => { 
        if (userProfile?.tipo === 'montador') {
            fetchData(); 
            if (userProfile.bono_entregado && !userProfile.bono_visto) {
                setShowWelcomeModal(true);
            }
        } else if (!accessToken) {
            setIsLoading(false);
        } else if (userProfile && userProfile.tipo === 'cliente') { 
            navigate('/panel-cliente');
        }
    }, [fetchData, userProfile, accessToken]);

    // --- MANEJADORES ---

    const handleCloseWelcome = async () => {
        setShowWelcomeModal(false);
        updateProfileData({ bono_visto: true });
        try {
            await fetch(`${API_BASE_URL}/api/perfil/dismiss-bono`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        } catch (e) { console.error("Error guardando estado de bono", e); }
    };

    const abrirChat = (trabajo: TrabajoMontador) => {
        setChatJobId(trabajo.trabajo_id);
        setIsChatOpen(true);
    };

    const handleStripeOnboarding = async (trabajoId: number | null) => {
        setIsStripeLoading(true);
        if (!accessToken) return;
        try {
             if (trabajoId !== null) localStorage.setItem('kiq_pending_job_id', trabajoId.toString());
             const res = await fetch(`${API_BASE_URL}/api/montador/stripe-onboarding`, {
                 method: 'POST',
                 headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
             });
             const data = await res.json();
             if (data.url) {
                 updateProfileData({ stripe_boarding_completado: true });
                 window.location.href = data.url;
             }
             else throw new Error(data.error);
        } catch (err) {
             setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: 'Fallo conexión Stripe.', confirmText: 'Cerrar', onConfirm: undefined });
             setIsStripeLoading(false);
        }
    };

    const ejecutarAceptarTrabajo = async (trabajoId: number) => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/montador/trabajo/${trabajoId}/aceptar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (res.ok) {
                setModalInfo({
                    isOpen: true, type: 'success', title: '¡Trabajo Aceptado!',
                    message: 'El trabajo es tuyo.', confirmText: 'Ir a mis tareas',
                    onConfirm: () => { cerrarModal(); setActiveTab('activos'); }
                });
                fetchData(); 
            } else {
                if (res.status === 402) {
                    setModalInfo({ isOpen: true, type: 'info', title: 'Recarga Necesaria', message: 'No tienes suficientes Gemas.', confirmText: 'Ir a la Tienda', onConfirm: () => { cerrarModal(); setTimeout(() => openGemStore(), 200); } });
                } else {
                    setModalInfo({ isOpen: true, type: 'danger', title: 'Ups...', message: data.error, confirmText: 'Cerrar', onConfirm: undefined });
                }
            }
        } catch (err) {
            setModalInfo({ isOpen: true, type: 'danger', title: 'Error de Red', message: 'Comprueba tu internet.', confirmText: 'Cerrar', onConfirm: undefined });
        }
    };

    const solicitarAceptarTrabajo = (trabajo: TrabajoMontador) => {
        if (!userProfile) return;
        if (trabajo.metodo_pago === 'efectivo_gemas') {
            const costeGemas = Math.max(10, Math.floor(trabajo.precio_calculado * 0.10 * 10)); 
            const esPrimerTrabajo = misTrabajosAsignados.length === 0;
            const costeReal = esPrimerTrabajo ? 0 : costeGemas;

            if (userGems < costeReal) {
                setModalInfo({ isOpen: true, type: 'info', title: 'Recarga Necesaria', message: `Necesitas ${costeReal} gemas.`, confirmText: 'Conseguir Gemas', onConfirm: () => { cerrarModal(); setTimeout(() => openGemStore(), 200); } });
                return;
            }
            const mensajeCoste = esPrimerTrabajo ? '¡Comisión GRATIS!' : `Se descontarán ${costeGemas} gemas.`;
            setModalInfo({ isOpen: true, type: 'success', title: 'Aceptar Trabajo (Efectivo)', message: `Cobrarás en mano. ${mensajeCoste}`, confirmText: 'Aceptar', onConfirm: () => ejecutarAceptarTrabajo(trabajo.trabajo_id) });
            return;
        }

        const montadorStripeId = userProfile.tipo === 'montador' ? userProfile.stripe_account_id : null;
        const isStripeReady = userProfile.stripe_boarding_completado ?? !!montadorStripeId;
        if (!isStripeReady) {
            setModalInfo({ isOpen: true, type: 'info', title: 'Requiere Cuenta Bancaria', message: 'Conecta tu cuenta Stripe para recibir pagos.', confirmText: 'Conectar Ahora', onConfirm: () => handleStripeOnboarding(trabajo.trabajo_id) });
            return;
        }
        setModalInfo({ isOpen: true, type: 'info', title: 'Aceptar Trabajo (Tarjeta)', message: `El pago seguro se procesará a través de Kiq.`, confirmText: 'Aceptar Trabajo', onConfirm: () => ejecutarAceptarTrabajo(trabajo.trabajo_id) });
    };

    const triggerFileUpload = (trabajoId: number) => { setSelectedJobIdForUpload(trabajoId); fileInputRef.current?.click(); };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedJobIdForUpload || !accessToken) return;
        const file = e.target.files[0];
        setIsUploading(true);
        const formData = new FormData();
        formData.append('imagen', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/montador/trabajo/${selectedJobIdForUpload}/finalizar-con-evidencia`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` }, body: formData });
            if (res.ok) {
                setModalInfo({ isOpen: true, type: 'success', title: '¡Evidencia Subida!', message: 'Trabajo marcado como finalizado.', confirmText: 'Genial', onConfirm: undefined });
                setMisTrabajosAsignados(prev => prev.map(t => t.trabajo_id === selectedJobIdForUpload ? { ...t, estado: 'revision_cliente' } : t));
            } else {
                 const data = await res.json();
                 setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: data.error, confirmText: 'Cerrar', onConfirm: undefined });
            }
        } catch (err) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: 'Fallo de red.', confirmText: 'Cerrar', onConfirm: undefined }); } 
        finally { setIsUploading(false); setSelectedJobIdForUpload(null); e.target.value = ''; }
    };

    const ejecutarReporteIncidencia = async (trabajoId: number) => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/montador/trabajo/${trabajoId}/reportar-fallido`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` } });
            const data = await res.json();
            if (res.ok) {
                setModalInfo({ isOpen: true, type: 'success', title: 'Cancelado', message: data.message, confirmText: 'Entendido', onConfirm: () => cerrarModal() });
                fetchData(); 
            } else {
                setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: data.error, confirmText: 'Cerrar', onConfirm: undefined });
            }
        } catch (err) { setModalInfo({ isOpen: true, type: 'danger', title: 'Error de Red', message: 'Comprueba tu conexión.', confirmText: 'Cerrar', onConfirm: undefined }); }
    };

    const handleReportarIncidencia = (trabajoId: number) => {
        setModalInfo({ isOpen: true, type: 'danger', title: '¿Cancelar Trabajo?', message: 'Se reportará una incidencia. ¿Estás seguro?', confirmText: 'Sí, Cancelar', onConfirm: () => ejecutarReporteIncidencia(trabajoId) });
    };

    // --- FILTRADO ---
    const activos = ['aceptado', 'revision_cliente', 'aprobado_cliente_stripe'];
    const historial = ['completado', 'cancelado', 'cancelado_incidencia'];

    const displayedJobs = activeTab === 'disponibles' ? trabajosDisponibles : 
                            activeTab === 'activos' ? misTrabajosAsignados.filter(t => activos.includes(t.estado)) :
                            misTrabajosAsignados.filter(t => historial.includes(t.estado));

    const getStatusInfo = (estado: string) => {
        switch (estado) {
            case 'pendiente': return { label: 'Oportunidad', color: 'bg-green-100 text-green-700 border-green-200' };
            case 'aceptado': return { label: 'En Curso', color: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'revision_cliente': return { label: 'En Revisión', color: 'bg-purple-100 text-purple-700 border-purple-200' };
            case 'aprobado_cliente_stripe': return { label: 'Pago Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
            case 'completado': return { label: 'Finalizado', color: 'bg-gray-100 text-gray-600 border-gray-200' };
            default: return { label: estado, color: 'bg-gray-50 text-gray-500' };
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
    const showWelcomeBanner = userProfile.tipo === 'montador' && userProfile.bono_entregado;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

            <div className="max-w-5xl mx-auto py-8 px-6"> 
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight"><span className="text-indigo-600">{perfil.nombre}</span> 👋</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Panel de Montador</p>
                    </div>
                    {/* Botón Vender */}
                    <button 
                        onClick={() => setIsVenderModalOpen(true)}
                        className="bg-yellow-400 text-yellow-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-yellow-300 transition flex items-center gap-2 transform hover:scale-105"
                    >
                        <FaTag className="text-yellow-800"/> Vender
                    </button>
                </div>

                {showWelcomeBanner && (
                    <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl mb-6 shadow-md animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <FaGift size={24} className="text-yellow-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-yellow-800">¡Bono de Bienvenida Activado!</h3>
                                <p className="text-sm text-yellow-700 mt-1">Hemos cargado gemas en tu saldo.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PESTAÑAS --- */}
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 py-2 mb-8">
                    
                    <button 
                        onClick={() => setActiveTab('disponibles')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${
                            activeTab === 'disponibles' 
                            ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                        }`}
                    >
                        <FaSearch className={`text-2xl ${activeTab === 'disponibles' ? 'text-indigo-600' : 'inherit'}`} />
                        <span className={`text-sm font-bold ${activeTab === 'disponibles' ? 'text-indigo-600' : 'inherit'}`}>
                            Oportunidades
                        </span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('activos')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${
                            activeTab === 'activos' 
                            ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                        }`}
                    >
                        <FaClipboardList className={`text-2xl ${activeTab === 'activos' ? 'text-indigo-600' : 'inherit'}`} />
                        <span className={`text-sm font-bold ${activeTab === 'activos' ? 'text-indigo-600' : 'inherit'}`}>
                            En Curso
                        </span>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('ventas')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${
                            activeTab === 'ventas' 
                            ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                        }`}
                    >
                        <FaTag className={`text-2xl ${activeTab === 'ventas' ? 'text-green-600' : 'inherit'}`} />
                        <span className={`text-sm font-bold ${activeTab === 'ventas' ? 'text-green-600' : 'inherit'}`}>
                            Mis Productos
                        </span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('historial')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 min-w-[100px] md:min-w-[120px] ${
                            activeTab === 'historial' 
                            ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-105 border border-transparent' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                        }`}
                    >
                        <FaHistory className={`text-2xl ${activeTab === 'historial' ? 'text-indigo-600' : 'inherit'}`} />
                        <span className={`text-sm font-bold ${activeTab === 'historial' ? 'text-indigo-600' : 'inherit'}`}>
                            Historial
                        </span>
                    </button>
                </div>

                {/* --- CONTENIDO --- */}

                {/* A. VISTA MIS PRODUCTOS (INVENTARIO) */}
                {activeTab === 'ventas' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        {misProductos.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                <FaTag className="mx-auto text-gray-300 text-4xl mb-3" />
                                <p className="text-gray-500 font-medium">No tienes productos en venta.</p>
                                <button onClick={() => setIsVenderModalOpen(true)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition">
                                    ¡Vender mi primer artículo!
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                <FaMoneyBillWave/> Gestiona este producto
                                            </div>
                                        </JobCard>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* B. VISTA TRABAJOS (SERVICIOS) */}
                {activeTab !== 'ventas' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {displayedJobs.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400 font-medium">No hay trabajos en esta sección.</p>
                            </div>
                        ) : (
                            displayedJobs.map((trabajo) => {
                                const status = getStatusInfo(trabajo.estado);
                                const puedeChatear = activeTab !== 'disponibles';

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
                                        
                                        // 🔥 AQUÍ SE ENVÍA EL TELÉFONO A LA TARJETA
                                        // Si el backend envía null (disponibles), esto es null y no se ve nada.
                                        // Si el backend envía número (aceptado), esto es string y se ve la ventana mágica.
                                        clientPhone={trabajo.cliente_info?.telefono}

                                        onChatClick={
                                            (activeTab === 'activos' && trabajo.estado === 'aceptado') ? undefined : 
                                            (puedeChatear ? () => abrirChat(trabajo) : undefined)
                                        }
                                    >
                                            <div className="flex gap-2 mb-3">
                                                {trabajo.metodo_pago === 'efectivo_gemas' ? (
                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Cobras en Efectivo</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full flex items-center gap-1"><FaCreditCard/> Cobras por Stripe</span>
                                                )}
                                            </div>

                                            {trabajo.desglose && <JobBreakdown desglose={trabajo.desglose} precioFinal={trabajo.precio_calculado} modo="recibir" />}

                                            <div className="mt-4 flex flex-col gap-2">
                                                {activeTab === 'disponibles' && (
                                                    <button onClick={() => solicitarAceptarTrabajo(trabajo)} className={`w-full py-3 font-bold text-white rounded-xl shadow transition ${trabajo.metodo_pago === 'efectivo_gemas' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{trabajo.metodo_pago === 'efectivo_gemas' ? 'Aceptar (Cobro en Mano)' : 'Aceptar Trabajo'}</button>
                                                )}

                                                {/* BOTONES DIVIDIDOS INTACTOS */}
                                                {activeTab === 'activos' && trabajo.estado === 'aceptado' && (
                                                    <>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => abrirChat(trabajo)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-md active:scale-95"><FaCommentDots /> Chat</button>
                                                            <button onClick={() => triggerFileUpload(trabajo.trabajo_id)} disabled={isUploading} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-md active:scale-95">{isUploading ? 'Subiendo...' : <><FaCamera /> Finalizar</>}</button>
                                                        </div>
                                                        <button onClick={() => handleReportarIncidencia(trabajo.trabajo_id)} className="text-xs text-red-400 underline text-center mt-1">Reportar problema</button>
                                                    </>
                                                )}

                                                {activeTab === 'activos' && trabajo.estado === 'revision_cliente' && (
                                                    <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-center text-xs font-medium">Esperando confirmación del cliente...</div>
                                                )}
                                            </div>
                                    </JobCard>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Modales */}
                <ChatModal isOpen={isChatOpen} onClose={() => { setIsChatOpen(false); setChatJobId(null); }} jobId={chatJobId} currentUserId={perfil.id.toString()} currentUserRole="montador" jobTitle={`Chat de Trabajo #${chatJobId}`} myAvatar={perfil.foto_url || undefined} otherAvatar={trabajoChatActivo?.cliente_info?.foto_url || undefined} otherName={trabajoChatActivo?.cliente_info?.nombre || trabajoChatActivo?.cliente_nombre} />
                <WelcomeBonusModal isOpen={showWelcomeModal} onClose={handleCloseWelcome} />
                <VenderItemModal isOpen={isVenderModalOpen} onClose={() => setIsVenderModalOpen(false)} onSuccess={() => { alert("¡Publicado! Pronto aparecerá en el feed."); fetchData(); }} />
                <ModalConfirmacion isOpen={modalInfo.isOpen} onClose={cerrarModal} onConfirm={modalInfo.onConfirm} title={modalInfo.title} message={modalInfo.message} type={modalInfo.type} confirmText={modalInfo.confirmText} />
                
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Wrapper con Suspense para Build Correcto)
// ------------------------------------------------------------------
export default function PanelMontadorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Cargando panel...</div>}>
            <ContenidoPanelMontador />
        </Suspense>
    );
}
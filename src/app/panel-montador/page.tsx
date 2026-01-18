'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react'; 
import { 
  FaCreditCard, FaCamera, FaSearch, FaClipboardList, FaHistory, FaGem, 
  FaCheckCircle, FaGift, FaCommentDots, FaTag, FaMoneyBillWave, FaTools, FaExclamationTriangle 
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

// --- INTERFACES BLINDADAS ---
interface ItemDesglose { item: string; cantidad: number; precio_unitario: number; subtotal: number; necesita_anclaje: boolean; }
interface DesgloseDetallado { coste_muebles_base: number; coste_desplazamiento: number; distancia_km: string; coste_anclaje_estimado: number; total_extras: number; muebles_cotizados: ItemDesglose[]; }

interface EtiquetasTrabajo {
    tipo?: string;
    [key: string]: any;
}

interface TrabajoMontador { 
    trabajo_id: number; 
    descripcion: string; 
    direccion: string; 
    precio_calculado: number; 
    fecha_creacion: string; 
    cliente_nombre: string; 
    cliente_info?: { 
        nombre: string; 
        foto_url?: string; 
        telefono?: string; 
    }; 
    estado: string; 
    imagenes_urls?: string[]; 
    etiquetas?: EtiquetasTrabajo; 
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
// COMPONENTE INTERNO
// ------------------------------------------------------------------
function ContenidoPanelMontador() {
    const { userGems, openGemStore, userProfile, accessToken, handleLogout, updateProfileData } = useUI(); 
    const router = useRouter();
    const searchParams = useSearchParams(); 

    // Estados
    const [trabajosDisponibles, setTrabajosDisponibles] = useState<TrabajoMontador[]>([]);
    const [misTrabajosAsignados, setMisTrabajosAsignados] = useState<TrabajoMontador[]>([]);
    const [misProductos, setMisProductos] = useState<MyProduct[]>([]); 
    
    const [isLoading, setIsLoading] = useState(true);
    const [isStripeLoading, setIsStripeLoading] = useState(false);
    
    // Estados Modales
    const [chatJobId, setChatJobId] = useState<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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

    // Lógica Chat Automático
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

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        if (!accessToken) { handleLogout(); navigate('/acceso'); return; }

        try {
            const headers = { 'Authorization': `Bearer ${accessToken}`, 'Cache-Control': 'no-cache' };
            
            const [resDisponibles, resAsignados] = await Promise.all([
                fetch(`${API_BASE_URL}/api/montador/trabajos/disponibles?t=${Date.now()}`, { headers }),
                fetch(`${API_BASE_URL}/api/montador/mis-trabajos?t=${Date.now()}`, { headers }),
            ]);

            if (resDisponibles.status === 401 || resAsignados.status === 401) { handleLogout(); return; }
            
            setTrabajosDisponibles(await resDisponibles.json());
            setMisTrabajosAsignados(await resAsignados.json());

            try {
                const resProds = await fetch(`${API_BASE_URL}/api/outlet/mis-productos`, { headers });
                if (resProds.ok) {
                    setMisProductos(await resProds.json());
                }
            } catch (e) { console.error("Error inventario", e); }

            if (!searchParams.get('chat') && misTrabajosAsignados.some(t => ['aceptado', 'revision_cliente'].includes(t.estado))) {
                setActiveTab('activos');
            }

        } catch (err: any) { 
            console.error(err); 
        } finally { setIsLoading(false); }
    }, [accessToken, handleLogout, searchParams, misTrabajosAsignados]); 

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
        } catch (e) { console.error(e); }
    };

    const abrirChat = (trabajo: TrabajoMontador) => { setChatJobId(trabajo.trabajo_id); setIsChatOpen(true); };

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

    if (isLoading || !userProfile) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    
    const perfil = userProfile;
    const showWelcomeBanner = userProfile.tipo === 'montador' && userProfile.bono_entregado;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6"> 
                
                {/* --- HEADER PREMIUM --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-center md:text-left">
                        {/* ✅ AQUI ESTÁ EL CAMBIO: Agregado "Hola, " y asegurado el nombre completo */}
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hola, <span className="text-indigo-600">{perfil.nombre}</span> 👋</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Panel de Control para Montadores</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-indigo-700 font-bold text-sm">
                            <FaGem className="text-indigo-500"/> {userGems}
                        </div>
                        <button 
                            onClick={() => setIsVenderModalOpen(true)}
                            aria-label="Vender artículo"
                            className="bg-white text-slate-600 border border-gray-200 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:border-yellow-300 hover:text-yellow-700 hover:bg-yellow-50 transition flex items-center gap-2"
                        >
                            <FaTag /> Vender Muebles
                        </button>
                    </div>
                </div>

                {/* --- WELCOME BANNER (SI APLICA) --- */}
                {showWelcomeBanner && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 rounded-2xl mb-8 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-in fade-in zoom-in-95">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <FaGift size={24} className="text-yellow-600" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-extrabold text-lg text-yellow-900">¡Bono de Bienvenida Activado!</h3>
                            <p className="text-sm text-yellow-800">Hemos cargado gemas en tu saldo para que puedas empezar a trabajar.</p>
                        </div>
                    </div>
                )}

                {/* --- PESTAÑAS (TABS) PREMIUM --- */}
                <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar justify-start md:justify-center">
                    {[
                        { id: 'disponibles', label: 'Oportunidades', icon: FaSearch },
                        { id: 'activos', label: 'En Curso', icon: FaTools },
                        { id: 'ventas', label: 'Mis Ventas', icon: FaTag },
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

                {/* A. VISTA MIS PRODUCTOS (INVENTARIO) */}
                {activeTab === 'ventas' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {misProductos.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaTag className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-500 font-medium">No tienes productos en venta.</p>
                                <button onClick={() => setIsVenderModalOpen(true)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition">
                                    ¡Vender mi primer artículo!
                                </button>
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
                                            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-50 p-2 rounded-lg justify-center">
                                                <FaMoneyBillWave/> Gestiona este producto en el Outlet
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
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {displayedJobs.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaClipboardList className="text-slate-300 text-2xl" />
                                </div>
                                <p className="text-slate-500 font-medium">No hay trabajos en esta sección ahora mismo.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedJobs.map((trabajo) => {
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
                                            // En montador, el teléfono del cliente es el dato clave
                                            clientPhone={trabajo.cliente_info?.telefono}
                                            onChatClick={
                                                (activeTab === 'activos' && trabajo.estado === 'aceptado') ? undefined : 
                                                (puedeChatear ? () => abrirChat(trabajo) : undefined)
                                            }
                                        >
                                            <div className="flex gap-2 mb-4">
                                                {trabajo.metodo_pago === 'efectivo_gemas' ? (
                                                    <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 shadow-sm flex items-center gap-1">
                                                        <FaMoneyBillWave/> Cobras en Efectivo
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 shadow-sm flex items-center gap-1">
                                                        <FaCreditCard/> Cobras por Stripe
                                                    </span>
                                                )}
                                            </div>

                                            {trabajo.desglose && <JobBreakdown desglose={trabajo.desglose} precioFinal={trabajo.precio_calculado} modo="recibir" />}

                                            <div className="mt-5 flex flex-col gap-3">
                                                {activeTab === 'disponibles' && (
                                                    <button 
                                                        onClick={() => solicitarAceptarTrabajo(trabajo)} 
                                                        className={`w-full py-3 font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2 ${
                                                            trabajo.metodo_pago === 'efectivo_gemas' 
                                                            ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                                                            : 'bg-gradient-to-r from-indigo-600 to-blue-600'
                                                        }`}
                                                    >
                                                        {trabajo.metodo_pago === 'efectivo_gemas' ? <><FaMoneyBillWave/> Aceptar (Cobro en Mano)</> : 'Aceptar Trabajo'}
                                                    </button>
                                                )}

                                                {activeTab === 'activos' && trabajo.estado === 'aceptado' && (
                                                    <>
                                                        <div className="flex gap-3">
                                                            <button onClick={() => abrirChat(trabajo)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-md active:scale-95"><FaCommentDots /> Chat</button>
                                                            <button onClick={() => triggerFileUpload(trabajo.trabajo_id)} disabled={isUploading} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-md active:scale-95">{isUploading ? 'Subiendo...' : <><FaCamera /> Finalizar</>}</button>
                                                        </div>
                                                        <button onClick={() => handleReportarIncidencia(trabajo.trabajo_id)} className="text-xs text-red-400 underline text-center mt-1 flex items-center justify-center gap-1 hover:text-red-600"><FaExclamationTriangle/> Reportar problema</button>
                                                    </>
                                                )}

                                                {activeTab === 'activos' && trabajo.estado === 'revision_cliente' && (
                                                    <div className="bg-purple-50 text-purple-800 p-4 rounded-xl text-center text-xs font-bold border border-purple-100 shadow-sm">
                                                        ⌛ Esperando confirmación del cliente...
                                                    </div>
                                                )}
                                            </div>
                                        </JobCard>
                                    );
                                })}
                            </div>
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
// COMPONENTE PRINCIPAL
// ------------------------------------------------------------------
export default function PanelMontadorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>}>
            <ContenidoPanelMontador />
        </Suspense>
    );
}
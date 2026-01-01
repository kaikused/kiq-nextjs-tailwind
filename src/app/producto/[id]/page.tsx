'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaMapMarkerAlt, FaUserCircle, FaComments, FaShoppingBag, FaArrowLeft, FaShareAlt, FaHeart, FaTruck, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useUI } from '../../context/UIContext'; 
import OutletAuthModal from '../../components/OutletAuthModal'; 

// 👇 IMPORTACIONES PARA PAGOS
import PaymentSelectionModal from '../../components/PaymentSelectionModal';
import PaymentModal from '../../components/PaymentModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';

// 🆕 IMPORTACIONES DEL GUARDIÁN
import { usePaymentGuard, PaymentMethod } from '../../hooks/usePaymentGuard'; 
import PaymentMethodModal from '../../components/modals/PaymentMethodModal';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

interface ProductoDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  ubicacion: string;
  estado: string;
  fecha: string;
  vendedor: { id: number; nombre: string; tipo: string; foto: string | null; };
}

export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, userGems, openGemStore } = useUI(); 
  
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Estados de Auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'chat' | 'buy' | null>(null);

  // 👇 ESTADOS DE PAGO REAL (COMPRA DIRECTA)
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // 🆕 INICIALIZAR EL GUARDIÁN DEL CHAT
  const productId = params?.id ? String(params.id) : '';
  const { 
    isPaymentModalOpen: isGuardModalOpen, 
    closeModal: closeGuardModal, 
    initiateChat, 
    confirmPaymentMethod 
  } = usePaymentGuard(productId);

  // Estado para mensajes (Modal Confirmación)
  const [modalInfo, setModalInfo] = useState({
      isOpen: false,
      type: 'info' as 'info' | 'danger' | 'success',
      title: '',
      message: '',
      confirmText: 'Aceptar',
      onConfirm: undefined as (() => void) | undefined,
  });
  const cerrarInfoModal = () => setModalInfo(prev => ({...prev, isOpen: false}));


  // Cargar datos del producto
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        if (!params?.id) return;
        const res = await fetch(`${API_BASE_URL}/api/outlet/producto/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProducto(data);
        } else {
          router.push('/');
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProducto();
  }, [params?.id, router]);


  // --- LÓGICA DE NAVEGACIÓN (CHAT) ---
  // 🛠️ MODIFICADO: Acepta extraParams para forzar datos en la URL
  const proceedToChat = (extraParams?: string) => {
     if (!producto) return;
     
     const targetPanel = '/panel-cliente'; 
     // Construimos la URL base asegurándonos de que los IDs estén presentes
     let url = `${targetPanel}?accion=nuevo_chat&vendedor=${producto.vendedor.id}&producto=${producto.id}`;
     
     // Si recibimos parámetros extra (como la intención de pago), los añadimos
     if (extraParams) {
        url += `&${extraParams}`;
     }

     console.log("🚀 Navegando al chat:", url);
     router.push(url);
  };


  // --- LÓGICA DE PAGOS (NUEVA) ---

  // 1. PAGO EN EFECTIVO (Reserva)
  const handlePagarConEfectivo = async () => {
      setIsSelectionModalOpen(false);
      if (!producto) return;

      try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${API_BASE_URL}/api/outlet/comprar/efectivo`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ product_id: producto.id })
          });

          const data = await res.json();
          if (res.ok) {
              setModalInfo({
                  isOpen: true,
                  type: 'success',
                  title: '¡Producto Reservado!',
                  message: 'Has reservado este artículo. Se abrirá el chat para que coordines la recogida con el vendedor.',
                  confirmText: 'Ir al Chat',
                  onConfirm: () => proceedToChat() 
              });
              setProducto({...producto, estado: 'reservado'}); // Actualizamos vista local
          } else {
              throw new Error(data.error);
          }
      } catch (err: any) {
          setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: err.message, confirmText: 'Cerrar', onConfirm: undefined });
      }
  };

  // 2. PAGO CON TARJETA (Inicio)
  const handleIniciarPagoStripe = async () => {
      setIsSelectionModalOpen(false);
      if (!producto) return;

      try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${API_BASE_URL}/api/outlet/comprar/stripe`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ product_id: producto.id })
          });

          const data = await res.json();
          if (res.ok) {
              setClientSecret(data.client_secret);
              setPaymentModalOpen(true); // Abrimos pasarela
          } else {
              throw new Error(data.error);
          }
      } catch (err: any) {
          setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: err.message, confirmText: 'Cerrar', onConfirm: undefined });
      }
  };

  // 3. PAGO CON TARJETA (Confirmación tras éxito en Stripe)
  const handleConfirmarStripe = async (paymentIntentId: string) => {
      if (!producto) return;
      try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`${API_BASE_URL}/api/outlet/comprar/confirmar-stripe`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ 
                  product_id: producto.id,
                  payment_intent_id: paymentIntentId
              })
          });

          if (res.ok) {
              setPaymentModalOpen(false);
              setModalInfo({
                  isOpen: true,
                  type: 'success',
                  title: '¡Compra Exitosa!',
                  message: 'El pago se ha realizado correctamente. El dinero está seguro en Kiq hasta que recojas el producto.',
                  confirmText: 'Coordinar Recogida',
                  onConfirm: () => proceedToChat()
              });
              setProducto({...producto, estado: 'reservado'});
          } else {
              throw new Error('Error al confirmar la reserva en el servidor');
          }
      } catch (err: any) {
          setModalInfo({ isOpen: true, type: 'danger', title: 'Error', message: err.message, confirmText: 'Cerrar', onConfirm: undefined });
      }
  };


  // --- GESTIÓN DE INTERACCIÓN ---
  const handleAction = (action: 'chat' | 'buy') => {
    if (!isLoggedIn) {
      setPendingAction(action);
      setShowAuthModal(true);
      return;
    }
    
    if (action === 'chat') {
        const canProceed = initiateChat(); 
        if (canProceed) {
            proceedToChat();
        } 
    } else if (action === 'buy') {
        if (producto?.estado !== 'disponible') {
            alert("Este producto ya no está disponible.");
            return;
        }
        setIsSelectionModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
      if (pendingAction === 'chat') {
        const canProceed = initiateChat();
        if (canProceed) proceedToChat();
      }
      else if (pendingAction === 'buy') setIsSelectionModalOpen(true);
      setPendingAction(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Cargando...</div>;
  if (!producto) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* Navbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition group">
            <FaArrowLeft className="text-sm"/> <span className="font-bold text-sm hidden sm:inline">Volver al Outlet</span>
        </Link>
        <div className="flex gap-3 text-gray-400">
            <FaHeart size={20}/> <FaShareAlt size={20}/>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* GALERÍA */}
            <div className="lg:col-span-7 space-y-4">
                <div className="aspect-[4/3] w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative">
                    {producto.imagenes.length > 0 ? (
                        <img src={producto.imagenes[activeImage]} alt={producto.titulo} className="w-full h-full object-contain bg-gray-100"/>
                    ) : <div className="w-full h-full flex items-center justify-center text-gray-300">Sin imagen</div>}
                    
                    <div className={`absolute top-4 left-4 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 ${producto.estado === 'disponible' ? 'bg-white/90 text-green-700' : 'bg-gray-800 text-white'}`}>
                        {producto.estado === 'disponible' ? <><FaCheckCircle /> Disponible</> : '🚫 ' + producto.estado.toUpperCase()}
                    </div>
                </div>
                {producto.imagenes.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {producto.imagenes.map((img, idx) => (
                            <button key={idx} onClick={() => setActiveImage(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === idx ? 'border-indigo-600' : 'border-transparent opacity-70'}`}>
                                <img src={img} className="w-full h-full object-cover" alt={`Vista ${idx}`} />
                            </button>
                        ))}
                    </div>
                )}
                {/* Descripción Móvil */}
                <div className="block lg:hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Descripción</h3>
                    <p className="text-gray-800 text-sm whitespace-pre-line">{producto.descripcion}</p>
                </div>
            </div>

            {/* INFO */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
                    <div className="relative">
                        <p className="text-sm text-gray-500 mb-1">Precio de oportunidad</p>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black text-gray-900 tracking-tight">{producto.precio}€</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 leading-snug mb-6">{producto.titulo}</h1>
                        <div className="flex flex-col gap-3">
                             <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                <FaMapMarkerAlt className="text-red-500 text-lg"/>
                                <div><p className="font-bold text-gray-900">Ubicación</p><p className="text-xs">{producto.ubicacion}</p></div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <FaTruck className="text-indigo-600 text-lg"/>
                                <div><p className="font-bold text-indigo-900">Servicio Kiq</p><p className="text-xs text-indigo-700">Desmontaje y transporte opcional.</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vendedor */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {producto.vendedor.foto ? <img src={producto.vendedor.foto} className="w-14 h-14 rounded-full object-cover" alt=""/> : <FaUserCircle size={40} className="text-gray-300"/>}
                        <div>
                            <p className="font-bold text-gray-900">{producto.vendedor.nombre}</p>
                            <span className="text-xs text-gray-500">{producto.vendedor.tipo}</span>
                        </div>
                    </div>
                </div>
                
                {/* Descripción Desktop */}
                <div className="hidden lg:block bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sobre este artículo</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{producto.descripcion}</p>
                </div>
            </div>
        </div>
      </div>

      {/* BARRA INFERIOR (CTA) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50">
        <div className="max-w-6xl mx-auto flex gap-4">
            <button onClick={() => handleAction('chat')} className="flex-1 py-4 rounded-xl font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition flex justify-center items-center gap-2">
                <FaComments className="text-lg"/> Chat
            </button>
            <button 
                onClick={() => handleAction('buy')} 
                disabled={producto.estado !== 'disponible'}
                className="flex-[2] py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 shadow-lg transition flex justify-center items-center gap-2"
            >
                <FaShoppingBag className="text-lg"/> 
                {producto.estado === 'disponible' ? 'Comprar ahora' : 'No disponible'}
            </button>
        </div>
      </div>

      {/* --- MODALES --- */}
      
      <OutletAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 🆕 Guardián: Modal de Selección PRE-CHAT */}
      <PaymentMethodModal
        isOpen={isGuardModalOpen}
        onClose={closeGuardModal}
        onSelect={(method: PaymentMethod) => {
           // 1. Guardamos la selección en el hook (localStorage)
           confirmPaymentMethod(method);
           
           // 2. 🛠️ MODIFICADO: Navegamos con delay para evitar el limbo
           // y pasamos explícitamente la intención de pago en la URL
           setTimeout(() => {
             proceedToChat(`intencion_pago=${method.id}`);
           }, 100);
        }}
      />

      {/* 1. Selector de Pago (Para el botón COMPRAR) */}
      <PaymentSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelectStripe={handleIniciarPagoStripe}
        onSelectGems={handlePagarConEfectivo} 
        onConseguirGemas={openGemStore} 
        precio={producto.precio}
        saldoGemas={userGems}
        costeGemas={0} 
        esPrimerTrabajo={false}
      />

      {/* 2. Pasarela Stripe */}
      {isPaymentModalOpen && clientSecret && (
        <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            clientSecret={clientSecret}
            amount={producto.precio}
            clientName="Comprador Kiq"
            onPaymentSuccess={handleConfirmarStripe}
        />
      )}

      {/* 3. Feedback */}
      <ModalConfirmacion 
        isOpen={modalInfo.isOpen} 
        onClose={cerrarInfoModal} 
        onConfirm={modalInfo.onConfirm || cerrarInfoModal} 
        title={modalInfo.title} 
        message={modalInfo.message} 
        type={modalInfo.type} 
        confirmText={modalInfo.confirmText} 
      />

    </div>
  );
}
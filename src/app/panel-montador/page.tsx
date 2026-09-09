'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
  FaCamera, FaSearch, FaClipboardList, FaHistory, FaTools,
  FaExclamationTriangle, FaWhatsapp,
} from 'react-icons/fa';
import Link from 'next/link';
import ModalConfirmacion from '../components/ModalConfirmacion';
import JobCard from '../components/JobCard';
import JobBreakdown from '../components/JobBreakdown';
import { useUI } from '../context/UIContext';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

interface ItemDesglose {
  item: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  necesita_anclaje: boolean;
}
interface DesgloseDetallado {
  coste_muebles_base: number;
  coste_desplazamiento: number;
  distancia_km: string;
  coste_anclaje_estimado: number;
  total_extras: number;
  muebles_cotizados: ItemDesglose[];
}

interface TrabajoMontador {
  trabajo_id: number;
  descripcion: string;
  direccion: string;
  precio_calculado: number;
  fecha_creacion?: string;
  cliente_nombre: string;
  cliente_info?: {
    nombre: string;
    foto_url?: string;
    telefono?: string;
  };
  estado?: string;
  imagenes_urls?: string[];
  desglose?: DesgloseDetallado;
  metodo_pago?: string;
  cobrado?: boolean;
}

function waLink(phone?: string) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, '');
  if (!clean) return null;
  const withCountry = clean.startsWith('34') ? clean : `34${clean}`;
  return `https://wa.me/${withCountry}`;
}

function ContenidoPanelMontador() {
  const { userProfile, accessToken, handleLogout } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [trabajosDisponibles, setTrabajosDisponibles] = useState<TrabajoMontador[]>([]);
  const [misTrabajosAsignados, setMisTrabajosAsignados] = useState<TrabajoMontador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'disponibles' | 'activos' | 'historial'>('disponibles');
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

  const cerrarModal = () => setModalInfo((prev) => ({ ...prev, isOpen: false }));

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      const headers = { Authorization: `Bearer ${accessToken}`, 'Cache-Control': 'no-cache' };
      const [resDisponibles, resAsignados] = await Promise.all([
        fetch(`${API_BASE_URL}/api/montador/trabajos/disponibles?t=${Date.now()}`, { headers }),
        fetch(`${API_BASE_URL}/api/montador/mis-trabajos?t=${Date.now()}`, { headers }),
      ]);

      if (resDisponibles.status === 401 || resAsignados.status === 401) {
        handleLogout();
        return;
      }

      const dataDisponibles = resDisponibles.ok ? await resDisponibles.json() : [];
      const dataAsignados = resAsignados.ok ? await resAsignados.json() : [];
      setTrabajosDisponibles(Array.isArray(dataDisponibles) ? dataDisponibles : []);
      setMisTrabajosAsignados(Array.isArray(dataAsignados) ? dataAsignados : []);

      if (Array.isArray(dataAsignados) && dataAsignados.some((t: TrabajoMontador) =>
        ['aceptado', 'revision_cliente'].includes(t.estado || '')
      )) {
        setActiveTab('activos');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, handleLogout]);

  useEffect(() => {
    if (accessToken) {
      setIsLoading(true);
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [accessToken, fetchData]);

  useEffect(() => {
    if (searchParams.get('chat')) {
      router.replace('/panel-montador', { scroll: false });
    }
  }, [router, searchParams]);

  const ejecutarAceptarTrabajo = async (trabajoId: number) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/montador/trabajo/${trabajoId}/aceptar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        const tel = data.datos_contacto?.telefono as string | undefined;
        const wa = waLink(tel);
        setModalInfo({
          isOpen: true,
          type: 'success',
          title: 'Montaje aceptado',
          message: wa
            ? 'Ya es tuyo. Escribe al cliente por WhatsApp para concretar día y hora.'
            : 'Ya es tuyo. Cuando tengamos teléfono del cliente, saldrá aquí.',
          confirmText: wa ? 'Abrir WhatsApp' : 'Ver en curso',
          onConfirm: () => {
            cerrarModal();
            setActiveTab('activos');
            if (wa) window.open(wa, '_blank');
          },
        });
        fetchData();
      } else {
        setModalInfo({
          isOpen: true,
          type: 'danger',
          title: 'No se pudo aceptar',
          message: typeof data.error === 'string' ? data.error : 'El trabajo ya no está disponible.',
          confirmText: 'Cerrar',
          onConfirm: undefined,
        });
      }
    } catch {
      setModalInfo({
        isOpen: true,
        type: 'danger',
        title: 'Error de red',
        message: 'Comprueba tu conexión.',
        confirmText: 'Cerrar',
        onConfirm: undefined,
      });
    }
  };

  const solicitarAceptarTrabajo = (trabajo: TrabajoMontador) => {
    setModalInfo({
      isOpen: true,
      type: 'info',
      title: 'Aceptar este montaje',
      message: 'Pasará a En curso. Si hay teléfono, podrás escribir al cliente por WhatsApp.',
      confirmText: 'Aceptar',
      onConfirm: () => ejecutarAceptarTrabajo(trabajo.trabajo_id),
    });
  };

  const triggerFileUpload = (trabajoId: number) => {
    setSelectedJobIdForUpload(trabajoId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !selectedJobIdForUpload || !accessToken) return;
    const file = e.target.files[0];
    setIsUploading(true);
    const formData = new FormData();
    formData.append('imagen', file);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/montador/trabajo/${selectedJobIdForUpload}/finalizar-con-evidencia`,
        { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: formData }
      );
      if (res.ok) {
        setModalInfo({
          isOpen: true,
          type: 'success',
          title: 'Foto enviada',
          message: 'Marcado como hecho. Esperamos confirmación.',
          confirmText: 'Vale',
          onConfirm: undefined,
        });
        setMisTrabajosAsignados((prev) =>
          prev.map((t) =>
            t.trabajo_id === selectedJobIdForUpload ? { ...t, estado: 'revision_cliente' } : t
          )
        );
      } else {
        const data = await res.json();
        setModalInfo({
          isOpen: true,
          type: 'danger',
          title: 'Error',
          message: data.error || 'No se pudo subir la foto.',
          confirmText: 'Cerrar',
          onConfirm: undefined,
        });
      }
    } catch {
      setModalInfo({
        isOpen: true,
        type: 'danger',
        title: 'Error',
        message: 'Fallo de red.',
        confirmText: 'Cerrar',
        onConfirm: undefined,
      });
    } finally {
      setIsUploading(false);
      setSelectedJobIdForUpload(null);
      e.target.value = '';
    }
  };

  const handleReportarIncidencia = (trabajoId: number) => {
    setModalInfo({
      isOpen: true,
      type: 'danger',
      title: '¿Cancelar este montaje?',
      message: 'Se liberará para otro montador.',
      confirmText: 'Sí, cancelar',
      onConfirm: async () => {
        if (!accessToken) return;
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/montador/trabajo/${trabajoId}/reportar-fallido`,
            { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const data = await res.json();
          if (res.ok) {
            setModalInfo({
              isOpen: true,
              type: 'success',
              title: 'Cancelado',
              message: data.message || 'Trabajo cancelado.',
              confirmText: 'Entendido',
              onConfirm: () => cerrarModal(),
            });
            fetchData();
          } else {
            setModalInfo({
              isOpen: true,
              type: 'danger',
              title: 'Error',
              message: data.error || 'No se pudo cancelar.',
              confirmText: 'Cerrar',
              onConfirm: undefined,
            });
          }
        } catch {
          setModalInfo({
            isOpen: true,
            type: 'danger',
            title: 'Error de red',
            message: 'Comprueba tu conexión.',
            confirmText: 'Cerrar',
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const ejecutarCobro = async (
    trabajoId: number,
    payload: { metodo_pago?: string; cobrado?: boolean }
  ) => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/montador/trabajo/${trabajoId}/cobro`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setModalInfo({
          isOpen: true,
          type: 'danger',
          title: 'No se pudo guardar el cobro',
          message: typeof data.error === 'string' ? data.error : 'Inténtalo de nuevo.',
          confirmText: 'Cerrar',
          onConfirm: undefined,
        });
        return;
      }
      const patch = {
        metodo_pago: data.metodo_pago,
        cobrado: data.cobrado,
      };
      setMisTrabajosAsignados((prev) =>
        prev.map((t) => (t.trabajo_id === trabajoId ? { ...t, ...patch } : t))
      );
    } catch {
      setModalInfo({
        isOpen: true,
        type: 'danger',
        title: 'Error de red',
        message: 'Comprueba tu conexión.',
        confirmText: 'Cerrar',
        onConfirm: undefined,
      });
    }
  };

  const activosEstados = ['aceptado', 'revision_cliente', 'aprobado_cliente_stripe'];
  const historialEstados = ['completado', 'cancelado', 'cancelado_incidencia'];

  const displayedJobs =
    activeTab === 'disponibles'
      ? trabajosDisponibles
      : activeTab === 'activos'
        ? misTrabajosAsignados.filter((t) => activosEstados.includes(t.estado || ''))
        : misTrabajosAsignados.filter((t) => historialEstados.includes(t.estado || ''));

  const getStatusInfo = (estado?: string) => {
    switch (estado) {
      case 'pendiente':
      case undefined:
        return { label: 'Disponible', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'aceptado':
        return { label: 'En curso', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'revision_cliente':
        return { label: 'Foto enviada', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'aprobado_cliente_stripe':
        return { label: 'Pendiente de cobro', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'completado':
        return { label: 'Hecho', color: 'bg-gray-100 text-gray-600 border-gray-200' };
      default:
        return { label: estado || '—', color: 'bg-gray-50 text-gray-500' };
    }
  };

  const emptyCopy = {
    disponibles: {
      title: 'Aún no hay montajes publicados',
      body: 'Cuando Kiq publique un trabajo en el tablero, te aparecerá aquí con zona y precio. Completa tu zona y teléfono para estar listo.',
    },
    activos: {
      title: 'Nada en curso',
      body: 'Los montajes que aceptes saldrán aquí, con WhatsApp del cliente.',
    },
    historial: {
      title: 'Todavía no hay historial',
      body: 'Cuando cierres un montaje, lo verás en esta lista.',
    },
  }[activeTab];

  if (!accessToken && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-800 font-bold text-lg">Entra con tu cuenta de montador</p>
        <p className="text-slate-500 text-sm mt-2 mb-6">Este panel es solo para profesionales dados de alta.</p>
        <Link href="/" className="text-indigo-600 font-semibold hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (isLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (userProfile.tipo !== 'montador') {
    router.push('/');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hola, {userProfile.nombre}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Aquí verás los montajes disponibles. Completa tu{' '}
            <Link href="/panel-montador/configuracion" className="text-indigo-600 font-semibold hover:underline">
              zona y teléfono
            </Link>
            .
          </p>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar justify-start md:justify-center">
          {[
            { id: 'disponibles' as const, label: 'Disponibles', icon: FaSearch },
            { id: 'activos' as const, label: 'En curso', icon: FaTools },
            { id: 'historial' as const, label: 'Hechos', icon: FaHistory },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <tab.icon className={activeTab === tab.id ? 'text-indigo-300' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {displayedJobs.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardList className="text-slate-300 text-2xl" />
            </div>
            <p className="text-slate-800 font-bold">{emptyCopy.title}</p>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">{emptyCopy.body}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedJobs.map((trabajo) => {
              const status = getStatusInfo(trabajo.estado);
              const phone = trabajo.cliente_info?.telefono;
              const wa = waLink(phone);

              return (
                <JobCard
                  key={trabajo.trabajo_id}
                  title={trabajo.descripcion}
                  price={trabajo.precio_calculado}
                  date={
                    trabajo.fecha_creacion
                      ? new Date(trabajo.fecha_creacion).toLocaleDateString('es-ES')
                      : ''
                  }
                  location={trabajo.direccion}
                  imageUrl={trabajo.imagenes_urls?.[0]}
                  statusLabel={status.label}
                  statusColorClass={status.color}
                  onImageClick={() =>
                    trabajo.imagenes_urls?.[0] && window.open(trabajo.imagenes_urls[0], '_blank')
                  }
                  clientPhone={activeTab === 'activos' ? phone : undefined}
                >
                  {trabajo.desglose && (
                    <JobBreakdown desglose={trabajo.desglose} precioFinal={trabajo.precio_calculado} modo="recibir" />
                  )}

                  <div className="mt-5 flex flex-col gap-3">
                    {activeTab === 'disponibles' && (
                      <button
                        type="button"
                        onClick={() => solicitarAceptarTrabajo(trabajo)}
                        className="w-full py-3 font-bold text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition"
                      >
                        Aceptar montaje
                      </button>
                    )}

                    {activeTab === 'activos' && trabajo.estado === 'aceptado' && (
                      <>
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition flex justify-center items-center gap-2"
                          >
                            <FaWhatsapp /> WhatsApp al cliente
                          </a>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => ejecutarCobro(trabajo.trabajo_id, { metodo_pago: 'bizum' })}
                            className={`py-2.5 rounded-xl text-sm font-bold border ${
                              trabajo.metodo_pago === 'bizum'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            Bizum
                          </button>
                          <button
                            type="button"
                            onClick={() => ejecutarCobro(trabajo.trabajo_id, { metodo_pago: 'efectivo' })}
                            className={`py-2.5 rounded-xl text-sm font-bold border ${
                              trabajo.metodo_pago === 'efectivo'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            Efectivo
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => ejecutarCobro(trabajo.trabajo_id, { cobrado: !trabajo.cobrado })}
                          className={`w-full py-3 font-bold rounded-xl border ${
                            trabajo.cobrado
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}
                        >
                          {trabajo.cobrado ? 'Cobrado' : 'Marcar cobrado'}
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerFileUpload(trabajo.trabajo_id)}
                          disabled={isUploading}
                          className="w-full py-3 bg-white text-slate-800 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition flex justify-center items-center gap-2"
                        >
                          {isUploading ? 'Subiendo…' : <><FaCamera /> Subir foto y marcar hecho</>}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReportarIncidencia(trabajo.trabajo_id)}
                          className="text-xs text-red-400 hover:text-red-600 flex items-center justify-center gap-1"
                        >
                          <FaExclamationTriangle /> No puedo hacerlo
                        </button>
                      </>
                    )}

                    {activeTab === 'activos' && trabajo.estado === 'revision_cliente' && (
                      <div className="space-y-3">
                        <div className="bg-slate-50 text-slate-600 p-4 rounded-xl text-center text-sm border border-slate-100">
                          Foto enviada. Esperamos confirmación.
                        </div>
                        <button
                          type="button"
                          onClick={() => ejecutarCobro(trabajo.trabajo_id, { cobrado: !trabajo.cobrado })}
                          className={`w-full py-3 font-bold rounded-xl border ${
                            trabajo.cobrado
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}
                        >
                          {trabajo.cobrado ? 'Cobrado' : 'Marcar cobrado'}
                        </button>
                      </div>
                    )}
                  </div>
                </JobCard>
              );
            })}
          </div>
        )}

        <ModalConfirmacion
          isOpen={modalInfo.isOpen}
          onClose={cerrarModal}
          onConfirm={modalInfo.onConfirm}
          title={modalInfo.title}
          message={modalInfo.message}
          type={modalInfo.type}
          confirmText={modalInfo.confirmText}
        />
      </div>
    </div>
  );
}

export default function PanelMontadorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <ContenidoPanelMontador />
    </Suspense>
  );
}

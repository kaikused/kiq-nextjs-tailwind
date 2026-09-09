'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import {
  FaClipboardList, FaHistory, FaPlus, FaWhatsapp, FaCheckCircle,
} from 'react-icons/fa';
import { useUI } from '../context/UIContext';
import ModalConfirmacion from '@/app/components/ModalConfirmacion';
import JobCard from '../components/JobCard';
import JobBreakdown from '../components/JobBreakdown';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';
const WHATSAPP_KIQ =
  'https://wa.me/34664497889?text=' +
  encodeURIComponent('Hola, vengo de kiq.es. Quiero un presupuesto de montaje.');

interface ItemDesglose {
  item: string;
  cantidad: number;
  subtotal: number;
  precio_unitario: number;
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

interface TrabajoCliente {
  trabajo_id: number;
  descripcion: string;
  direccion: string;
  estado: string;
  precio_calculado: number;
  fecha_creacion: string;
  montador_info?: { nombre: string; telefono: string; foto_url?: string };
  imagenes_urls?: string[];
  desglose?: DesgloseDetallado;
  etiquetas?: { tipo?: string; [key: string]: unknown };
  metodo_pago?: string;
  cobrado?: boolean;
  zona?: string;
  fecha_visita?: string;
}

function waMontador(phone?: string) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, '');
  if (!clean) return null;
  const withCountry = clean.startsWith('34') ? clean : `34${clean}`;
  return `https://wa.me/${withCountry}`;
}

function ContenidoPanelCliente() {
  const { userProfile, accessToken, handleLogout, openCalculatorModal } = useUI();
  const router = useRouter();

  const [trabajos, setTrabajos] = useState<TrabajoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activos' | 'hechos'>('activos');
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    type: 'info' as 'info' | 'danger' | 'success',
    title: '',
    message: '',
    confirmText: 'Aceptar',
    onConfirm: undefined as (() => void) | undefined,
  });

  const cerrarModal = () => setModalInfo((prev) => ({ ...prev, isOpen: false }));

  const fetchTrabajos = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cliente/mis-trabajos`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Cache-Control': 'no-cache' },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = res.ok ? await res.json() : [];
      setTrabajos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [accessToken, handleLogout]);

  useEffect(() => {
    if (userProfile?.tipo === 'montador') {
      router.push('/panel-montador');
      return;
    }
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    if (userProfile?.tipo === 'cliente') {
      setIsLoading(true);
      fetchTrabajos().finally(() => setIsLoading(false));
    }
  }, [fetchTrabajos, userProfile, accessToken, router]);

  const ejecutarConfirmar = async (tid: number) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cliente/trabajo/${tid}/confirmar-pago`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('No se pudo confirmar');
      fetchTrabajos();
      setModalInfo({
        isOpen: true,
        type: 'success',
        title: 'Listo',
        message: 'Marcamos el montaje como hecho.',
        confirmText: 'Cerrar',
        onConfirm: undefined,
      });
    } catch {
      setModalInfo({
        isOpen: true,
        type: 'danger',
        title: 'Error',
        message: 'No se pudo confirmar.',
        confirmText: 'Cerrar',
        onConfirm: undefined,
      });
    }
  };

  const activosEstados = ['cotizacion', 'pendiente', 'aceptado', 'revision_cliente', 'aprobado_cliente_stripe'];
  const hechosEstados = ['completado', 'cancelado', 'cancelado_incidencia'];

  const lista = trabajos.filter((t) => t.etiquetas?.tipo !== 'outlet');
  const displayed =
    activeTab === 'activos'
      ? lista.filter((t) => activosEstados.includes(t.estado))
      : lista.filter((t) => hechosEstados.includes(t.estado));

  const getStatusInfo = (estado: string) => {
    switch (estado) {
      case 'cotizacion':
        return { label: 'Kiq está revisando', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'pendiente':
        return { label: 'En espera de montador', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'aceptado':
        return { label: 'Montador asignado', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'revision_cliente':
        return { label: 'Confirmar que está hecho', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'completado':
        return { label: 'Hecho', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: estado, color: 'bg-gray-50 text-gray-600' };
    }
  };

  if (!accessToken && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-800 font-bold text-lg">Entra para ver tu cuenta</p>
        <p className="text-slate-500 text-sm mt-2 mb-6">
          El presupuesto no necesita cuenta: pides precio y te llega por WhatsApp.
        </p>
        <Link href="/" className="text-indigo-600 font-semibold hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (isLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const emptyActivos = {
    title: 'Aún no hay montajes aquí',
    body: 'Si pides precio con la cuenta, verás la ficha en revisión de Kiq. Cuando la publiquemos, pasará a espera de montador.',
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hola, {userProfile.nombre}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              El precio te llega por WhatsApp. Aquí ves si Kiq está revisando tu montaje y, cuando se publique, si hay montador.{' '}
              <Link href="/panel-cliente/configuracion" className="text-indigo-600 font-semibold hover:underline">
                Teléfono y datos
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={WHATSAPP_KIQ}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-emerald-50"
            >
              <FaWhatsapp /> WhatsApp Kiq
            </a>
            <button
              type="button"
              onClick={() => openCalculatorModal('public')}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-indigo-700"
            >
              <FaPlus /> Pedir precio
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
          {[
            { id: 'activos' as const, label: 'En curso', icon: FaClipboardList },
            { id: 'hechos' as const, label: 'Hechos', icon: FaHistory },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 border border-gray-100'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardList className="text-slate-300 text-2xl" />
            </div>
            <p className="text-slate-800 font-bold">
              {activeTab === 'activos' ? emptyActivos.title : 'Todavía no hay historial'}
            </p>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              {activeTab === 'activos'
                ? emptyActivos.body
                : 'Cuando un montaje se cierre, aparecerá aquí.'}
            </p>
            {activeTab === 'activos' && (
              <button
                type="button"
                onClick={() => openCalculatorModal('public')}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Pedir precio
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((trabajo) => {
              const status = getStatusInfo(trabajo.estado);
              const wa = waMontador(trabajo.montador_info?.telefono);
              return (
                <JobCard
                  key={trabajo.trabajo_id}
                  title={trabajo.descripcion}
                  price={trabajo.precio_calculado}
                  date={
                    trabajo.fecha_visita
                      ? new Date(trabajo.fecha_visita).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : new Date(trabajo.fecha_creacion).toLocaleDateString('es-ES')
                  }
                  location={trabajo.zona || trabajo.direccion}
                  imageUrl={trabajo.imagenes_urls?.[0]}
                  statusLabel={status.label}
                  statusColorClass={status.color}
                  clientPhone={activeTab === 'activos' ? trabajo.montador_info?.telefono : undefined}
                >
                  {trabajo.desglose && (
                    <JobBreakdown
                      desglose={trabajo.desglose}
                      precioFinal={trabajo.precio_calculado}
                      modo="total"
                    />
                  )}
                  <div className="mt-4 flex flex-col gap-3">
                    {trabajo.estado !== 'cotizacion' && (
                    <p className="text-sm text-slate-600">
                      {trabajo.cobrado
                        ? 'Pagado al montador.'
                        : trabajo.metodo_pago === 'bizum'
                          ? 'Pago: Bizum al montador (fuera de la app).'
                          : 'Pago: efectivo al montador (fuera de la app).'}
                    </p>
                    )}
                    {wa && trabajo.estado === 'aceptado' && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2"
                      >
                        <FaWhatsapp /> WhatsApp al montador
                      </a>
                    )}
                    {trabajo.estado === 'revision_cliente' && (
                      <button
                        type="button"
                        onClick={() =>
                          setModalInfo({
                            isOpen: true,
                            type: 'success',
                            title: '¿El montaje está hecho?',
                            message: 'Confirma solo si el mueble quedó montado.',
                            confirmText: 'Sí, está hecho',
                            onConfirm: () => ejecutarConfirmar(trabajo.trabajo_id),
                          })
                        }
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> Confirmar montaje
                      </button>
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

export default function PanelClientePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <ContenidoPanelCliente />
    </Suspense>
  );
}

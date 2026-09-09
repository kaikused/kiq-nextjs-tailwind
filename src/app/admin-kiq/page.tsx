'use client';
import { useState, useEffect } from 'react';
import { 
  FaLock, FaSync, FaBriefcase, FaUserTie, FaSearch, 
  FaUsers, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle, 
  FaClock, FaToolbox, FaUser, FaTrash, FaGem, FaKey, FaSignOutAlt,
  FaPencilAlt, FaPaperPlane, FaInbox, FaFilePdf
} from 'react-icons/fa';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';
const ADMIN_SESSION_KEY = 'kiq_admin_jwt';
const ESTADOS_ADMIN = [
  { id: 'cotizacion', label: 'Kiq revisando' },
  { id: 'pendiente', label: 'Esperando montador' },
  { id: 'aceptado', label: 'Montador asignado' },
  { id: 'revision_cliente', label: 'Foto enviada' },
  { id: 'completado', label: 'Hecho' },
  { id: 'cancelado', label: 'Cancelado' },
  { id: 'cancelado_incidencia', label: 'Incidencia' },
]; 

export default function AdminDashboard() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminToken, setAdminToken] = useState('');
  
  // Datos
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // UI
  const [activeTab, setActiveTab] = useState<'inbox' | 'trabajos' | 'usuarios'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Gemas (Nuevo)
  const [gemModal, setGemModal] = useState<{isOpen: boolean, userId: number, userName: string} | null>(null);
  const [gemAmount, setGemAmount] = useState(0);
  const [resetModal, setResetModal] = useState<{
    userId: number; tipo: string; nombre: string; email: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [jobModal, setJobModal] = useState<any | null>(null);
  const [jobForm, setJobForm] = useState({
    descripcion: '', direccion: '', precio: '', telefono: '', metodo_pago: 'efectivo', cobrado: false, zona: '', fecha_visita: '', estado: 'cotizacion',
  });
  const [jobMessage, setJobMessage] = useState('');

  const adminHeaders = (token = adminToken) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (saved) {
      setAdminToken(saved);
      setIsAuth(true);
    }
  }, []);

  useEffect(() => {
    if (isAuth && adminToken) fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, adminToken]);

  const checkAuth = async () => {
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError('Contraseña incorrecta');
        return;
      }
      const data = await res.json();
      sessionStorage.setItem(ADMIN_SESSION_KEY, data.token);
      setAdminToken(data.token);
      setPassword('');
      setIsAuth(true);
    } catch {
      setLoginError('No se pudo conectar con el servidor');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminToken('');
    setIsAuth(false);
    setTrabajos([]);
    setUsuarios([]);
  };

  const fetchAllData = () => {
    fetchTrabajos();
    fetchUsuarios();
  };

  const fetchTrabajos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/todos-los-trabajos?t=${Date.now()}`, {
        headers: adminHeaders(),
      });
      if (res.ok) setTrabajos(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/usuarios?t=${Date.now()}`, {
        headers: adminHeaders(),
      });
      if (res.ok) setUsuarios(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // --- ACCIONES DE DIOS (GOD MODE) ---
  const handleGiveGems = async () => {
    if (!gemModal) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/asignar-gemas`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                montador_id: gemModal.userId,
                cantidad: gemAmount
            })
        });
        if (res.ok) {
            const data = await res.json();
            alert(`💎 ¡Hecho! Nuevo saldo de ${gemModal.userName}: ${data.nuevo_saldo} Gemas.`);
            setGemModal(null);
            setGemAmount(0);
            fetchUsuarios(); // Recargar tabla
        } else {
            alert("Error al asignar gemas.");
        }
    } catch (e) { alert("Error de red"); }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm("⚠️ ¿ESTÁS SEGURO? Esto borrará el trabajo, la cotización y el historial para siempre.")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/borrar-trabajo/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
            setTrabajos(prev => prev.filter(t => t.id !== id));
            fetchTrabajos();
        } else {
            alert("No se pudo borrar el trabajo.");
        }
    } catch (e) { alert("Error al borrar"); }
  };

  const handleDeleteUser = async (id: number, tipo: string) => {
    const confirmacion = prompt(`⚠️ PELIGRO: Vas a borrar al usuario ${id} (${tipo}). Escribe "BORRAR" para confirmar.`);
    if (confirmacion !== "BORRAR") return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/borrar-usuario/${id}/${tipo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
            setUsuarios(prev => prev.filter(u => u.id !== id));
            fetchUsuarios();
            alert("Usuario eliminado del sistema.");
        } else {
            const data = await res.json();
            alert("Error: " + (data.error || "No se pudo borrar."));
        }
    } catch (e) { alert("Error de red"); }
  };

  const openJobModal = (t: any) => {
    setJobModal(t);
    setJobMessage('');
    setJobForm({
      descripcion: t.descripcion || '',
      direccion: t.direccion || '',
      precio: String(t.precio ?? ''),
      telefono: t.telefono_cliente || '',
      metodo_pago: t.metodo_pago === 'bizum' ? 'bizum' : 'efectivo',
      cobrado: Boolean(t.cobrado),
      zona: t.zona || '',
      fecha_visita: t.fecha_visita ? String(t.fecha_visita).slice(0, 16) : '',
      estado: t.estado || 'cotizacion',
    });
  };

  const handleSaveJob = async () => {
    if (!jobModal) return;
    setJobMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/trabajo/${jobModal.id}`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          descripcion: jobForm.descripcion,
          direccion: jobForm.direccion,
          precio: Number(jobForm.precio),
          telefono: jobForm.telefono,
          metodo_pago: jobForm.metodo_pago,
          cobrado: jobForm.cobrado,
          zona: jobForm.zona,
          fecha_visita: jobForm.fecha_visita || null,
          estado: jobForm.estado,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJobMessage(data.error || 'No se pudo guardar');
        return;
      }
      setTrabajos((prev) => prev.map((j) => (j.id === data.id ? data : j)));
      setJobModal(data);
      setJobMessage('Guardado');
    } catch {
      setJobMessage('Error de red');
    }
  };

  const handlePublishJob = async (id: number) => {
    if (!confirm('¿Publicar en el tablero? El cliente y los montadores lo verán.')) return;
    try {
      if (jobModal?.id === id) {
        const saveRes = await fetch(`${API_BASE_URL}/api/admin/trabajo/${id}`, {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify({
            descripcion: jobForm.descripcion,
            direccion: jobForm.direccion,
            precio: Number(jobForm.precio),
            telefono: jobForm.telefono,
            metodo_pago: jobForm.metodo_pago,
            cobrado: jobForm.cobrado,
            zona: jobForm.zona,
          fecha_visita: jobForm.fecha_visita || null,
          estado: jobForm.estado,
        }),
        });
        const saved = await saveRes.json();
        if (!saveRes.ok) {
          setJobMessage(saved.error || 'No se pudo guardar');
          return;
        }
        setTrabajos((prev) => prev.map((j) => (j.id === saved.id ? saved : j)));
      }
      const res = await fetch(`${API_BASE_URL}/api/admin/trabajo/${id}/publicar`, {
        method: 'POST',
        headers: adminHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'No se pudo publicar. Revisa dirección y precio.');
        return;
      }
      setTrabajos((prev) => prev.map((j) => (j.id === data.id ? data : j)));
      if (jobModal?.id === id) setJobModal(null);
    } catch {
      alert('Error de red');
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal) return;
    if (newPassword.length < 8) {
      setResetMessage('Mínimo 8 caracteres');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({
          user_id: resetModal.userId,
          tipo: resetModal.tipo,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Contraseña nueva para ${resetModal.email}`);
        setResetModal(null);
        setNewPassword('');
        setResetMessage('');
      } else {
        setResetMessage(data.error || 'No se pudo cambiar');
      }
    } catch {
      setResetMessage('Error de red');
    }
  };

  // --- CALCULATED METRICS ---
  const totalIngresos = trabajos.reduce((acc, t) => acc + (t.precio || 0), 0);
  const trabajosActivos = trabajos.filter(t => ['pendiente', 'aceptado', 'revision_cliente'].includes(t.estado)).length;
  const inboxCount = trabajos.filter(t => t.estado === 'cotizacion').length;
  const montadoresCount = usuarios.filter(u => u.tipo === 'montador').length;
  const clientesCount = usuarios.filter(u => u.tipo === 'cliente').length;

  // --- FILTRADO ---
  const filteredTrabajos = trabajos.filter(t => 
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toString().includes(searchTerm)
  );
  const inboxTrabajos = filteredTrabajos.filter(t => t.estado === 'cotizacion');

  const filteredUsuarios = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FaLock className="text-slate-400 text-3xl" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">Kiq Admin</h1>
          <p className="text-slate-400 text-sm mb-8">Panel de Control Maestro</p>
          
          <input 
            type="password" 
            className="w-full p-4 border border-slate-200 bg-slate-50 rounded-xl mb-4 text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
          />
          {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
          <button 
            onClick={checkAuth} 
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Acceder
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* TOP BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
            <span className="font-bold text-lg tracking-tight">Kiq Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">GOD MODE</span>
             <button onClick={fetchAllData} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Refrescar datos">
                <FaSync className={loading ? "animate-spin" : ""} />
             </button>
             <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Salir">
                <FaSignOutAlt />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* KPI CARDS (RESUMEN) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><FaBriefcase size={20}/></div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1"><FaInbox size={10}/> Inbox</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{inboxCount}</h3>
                    <p className="text-slate-500 text-sm font-medium">Por revisar</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><FaMoneyBillWave size={20}/></div>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{totalIngresos.toLocaleString()}€</h3>
                    <p className="text-slate-500 text-sm font-medium">{trabajosActivos} en el tablero</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><FaToolbox size={20}/></div>
                    <span className="text-slate-400 text-xs font-mono">Total: {montadoresCount}</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{montadoresCount}</h3>
                    <p className="text-slate-500 text-sm font-medium">Montadores Registrados</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><FaUsers size={20}/></div>
                    <span className="text-slate-400 text-xs font-mono">Total: {clientesCount}</span>
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900">{clientesCount}</h3>
                    <p className="text-slate-500 text-sm font-medium">Clientes Registrados</p>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 sticky top-24">
                    <button 
                        onClick={() => setActiveTab('inbox')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'inbox' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <FaInbox /> Por revisar
                        {inboxCount > 0 && (
                          <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{inboxCount}</span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('trabajos')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'trabajos' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <FaBriefcase /> Tablero
                    </button>
                    <button 
                        onClick={() => setActiveTab('usuarios')} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'usuarios' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        <FaUserTie /> Gestión de Usuarios
                    </button>
                </div>
            </div>

            {/* TABLES AREA */}
            <div className="flex-grow w-full">
                
                {/* TOOLBAR */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                        {activeTab === 'inbox' ? `${inboxTrabajos.length} por revisar` :
                         activeTab === 'trabajos' ? `${filteredTrabajos.length} Resultados` : 
                         activeTab === 'usuarios' ? `${filteredUsuarios.length} Resultados` : 'Vista General'}
                    </div>
                </div>

                {/* INBOX KIQ */}
                {activeTab === 'inbox' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Cotizaciones por revisar</h2>
                            <p className="text-xs text-slate-500 mt-1">Solo clientes con cuenta. Edita y publica cuando el precio y la zona estén cerrados.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID / Fecha</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Zona / Descripción</th>
                                        <th className="px-6 py-4 text-right">Precio</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {inboxTrabajos.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-slate-400">#{t.id}</div>
                                                <div className="text-xs font-medium text-slate-600">{new Date(t.fecha).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{t.cliente}</div>
                                                <div className="text-xs text-slate-500">{t.telefono_cliente || 'Sin teléfono'}</div>
                                                <div className="text-[10px] text-slate-400">{t.email_cliente}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-semibold text-slate-700">{t.direccion || 'Sin zona'}</div>
                                                <div className="max-w-xs truncate text-slate-500" title={t.descripcion}>{t.descripcion}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{t.precio}€</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => openJobModal(t)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Editar">
                                                        <FaPencilAlt />
                                                    </button>
                                                    <button onClick={() => handlePublishJob(t.id)} className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Publicar">
                                                        <FaPaperPlane />
                                                    </button>
                                                    <button onClick={() => handleDeleteJob(t.id)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Descartar">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {inboxTrabajos.length === 0 && <EmptyState text="No hay cotizaciones pendientes de revisar" />}
                        </div>
                    </div>
                )}

                {/* VISTA TRABAJOS */}
                {activeTab === 'trabajos' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">Todos los trabajos</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID / Fecha</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Descripción</th>
                                        <th className="px-6 py-4 text-right">Precio</th>
                                        <th className="px-6 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredTrabajos.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-slate-400">#{t.id}</div>
                                                <div className="text-xs font-medium text-slate-600">{new Date(t.fecha).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{t.cliente}</div>
                                                <div className="text-xs text-slate-500">{t.telefono_cliente || 'Sin teléfono'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate text-slate-600 font-medium" title={t.descripcion}>{t.descripcion}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{t.precio}€</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StatusBadge status={t.estado} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => openJobModal(t)}
                                                        className="p-2 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Editar"
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                    {t.pdf_code && (
                                                        <a
                                                            href={`${API_BASE_URL}/p/${t.pdf_code}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Ver PDF"
                                                        >
                                                            <FaFilePdf />
                                                        </a>
                                                    )}
                                                    {t.estado === 'cotizacion' && (
                                                        <button
                                                            onClick={() => handlePublishJob(t.id)}
                                                            className="p-2 text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                            title="Publicar"
                                                        >
                                                            <FaPaperPlane />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteJob(t.id)}
                                                        className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Borrar Trabajo (Irreversible)"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredTrabajos.length === 0 && <EmptyState text="No se encontraron trabajos" />}
                        </div>
                    </div>
                )}

                {/* VISTA USUARIOS */}
                {(activeTab === 'usuarios') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="font-bold text-slate-800">Directorio de Usuarios</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Contacto</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Zona</th>
                                        <th className="px-6 py-4 text-center">Gemas</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsuarios.map((u) => (
                                        <tr key={`${u.tipo}-${u.id}`} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.tipo === 'montador' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                        {u.nombre ? u.nombre.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{u.nombre}</div>
                                                        <div className="text-[10px] text-slate-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-600">{u.email}</div>
                                                <div className="text-xs text-slate-400">{u.telefono || '--'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.tipo === 'montador' ? (
                                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-purple-100">
                                                        <FaToolbox /> Montador
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-blue-100">
                                                        <FaUser /> Cliente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 font-medium text-xs bg-slate-100 px-2 py-1 rounded">{u.zona || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {u.tipo === 'montador' ? (
                                                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 flex items-center justify-center gap-1 w-fit mx-auto">
                                                        <FaGem size={10}/> {u.saldo || 0}
                                                    </span>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                      setResetModal({
                                                        userId: u.id,
                                                        tipo: u.tipo,
                                                        nombre: u.nombre,
                                                        email: u.email,
                                                      });
                                                      setNewPassword('');
                                                      setResetMessage('');
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Nueva contraseña"
                                                >
                                                    <FaKey />
                                                </button>
                                                {u.tipo === 'montador' && (
                                                    <button 
                                                        onClick={() => setGemModal({ isOpen: true, userId: u.id, userName: u.nombre })}
                                                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Gestionar Gemas"
                                                    >
                                                        <FaGem />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.tipo)}
                                                    className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar Usuario"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsuarios.length === 0 && <EmptyState text="No se encontraron usuarios" />}
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>

      {/* MODAL GEMAS (DISEÑO LIGHT) */}
      {gemModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">💎 Asignar Gemas</h3>
                    <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">{gemModal.userName}</div>
                </div>
                
                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">Cantidad (+ Añadir, - Quitar)</label>
                    <input 
                        type="number" 
                        value={gemAmount} 
                        onChange={e => setGemAmount(parseInt(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-3xl font-black text-slate-800 focus:border-indigo-500 focus:outline-none text-center"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setGemModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Cancelar</button>
                    <button onClick={handleGiveGems} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Ejecutar</button>
                </div>
            </div>
        </div>
      )}

      {resetModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Nueva contraseña</h3>
                <p className="text-sm text-slate-500 mb-4">{resetModal.nombre} · {resetModal.email}</p>
                <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 font-mono"
                    autoFocus
                />
                {resetMessage && <p className="text-red-500 text-sm mb-3">{resetMessage}</p>}
                <div className="flex gap-3">
                    <button
                      onClick={() => { setResetModal(null); setNewPassword(''); }}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition"
                    >
                      Guardar
                    </button>
                </div>
            </div>
        </div>
      )}

      {jobModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Revisar cotización #{jobModal.id}</h3>
                <p className="text-sm text-slate-500 mb-4">{jobModal.cliente} · {jobModal.email_cliente}</p>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción</label>
                <textarea
                    value={jobForm.descripcion}
                    onChange={(e) => setJobForm({ ...jobForm, descripcion: e.target.value })}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm"
                />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dirección / zona</label>
                <input
                    type="text"
                    value={jobForm.direccion}
                    onChange={(e) => setJobForm({ ...jobForm, direccion: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm"
                />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Zona (filtro montadores)</label>
                <input
                    type="text"
                    value={jobForm.zona}
                    onChange={(e) => setJobForm({ ...jobForm, zona: e.target.value })}
                    placeholder="Ej. Sevilla"
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm"
                />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha y hora de visita</label>
                <input
                    type="datetime-local"
                    value={jobForm.fecha_visita}
                    onChange={(e) => setJobForm({ ...jobForm, fecha_visita: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm"
                />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono</label>
                <input
                    type="text"
                    value={jobForm.telefono}
                    onChange={(e) => setJobForm({ ...jobForm, telefono: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm"
                />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Precio (€)</label>
                <input
                    type="number"
                    value={jobForm.precio}
                    onChange={(e) => setJobForm({ ...jobForm, precio: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm font-bold"
                />
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cobro</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setJobForm({ ...jobForm, metodo_pago: 'bizum' })}
                      className={`py-2.5 rounded-xl text-sm font-bold border ${jobForm.metodo_pago === 'bizum' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      Bizum
                    </button>
                    <button
                      type="button"
                      onClick={() => setJobForm({ ...jobForm, metodo_pago: 'efectivo' })}
                      className={`py-2.5 rounded-xl text-sm font-bold border ${jobForm.metodo_pago === 'efectivo' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      Efectivo
                    </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                    <input
                      type="checkbox"
                      checked={jobForm.cobrado}
                      onChange={(e) => setJobForm({ ...jobForm, cobrado: e.target.checked })}
                    />
                    Cobrado
                </label>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado del pedido</label>
                <select
                    value={jobForm.estado}
                    onChange={(e) => setJobForm({ ...jobForm, estado: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 text-sm font-bold bg-white"
                >
                  {ESTADOS_ADMIN.map((e) => (
                    <option key={e.id} value={e.id}>{e.label}</option>
                  ))}
                </select>
                {jobModal.foto_finalizacion && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Foto del montador</p>
                    <a href={jobModal.foto_finalizacion} target="_blank" rel="noopener noreferrer">
                      <img src={jobModal.foto_finalizacion} alt="Evidencia" className="w-full max-h-48 object-cover rounded-xl border border-slate-200" />
                    </a>
                  </div>
                )}
                {Array.isArray(jobModal.imagenes_urls) && jobModal.imagenes_urls.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fotos de la cotización</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {jobModal.imagenes_urls.map((url: string) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {jobModal.pdf_code ? (
                  <a
                    href={`${API_BASE_URL}/p/${jobModal.pdf_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-slate-800"
                  >
                    <FaFilePdf /> Ver PDF
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 mb-3">PDF: solo en cotizaciones nuevas (con cuenta) a partir de ahora.</p>
                )}
                {jobMessage && <p className="text-sm mb-3 text-indigo-600">{jobMessage}</p>}
                <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setJobModal(null)}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={handleSaveJob}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition"
                    >
                      Guardar
                    </button>
                    {jobModal.estado === 'cotizacion' && (
                      <button
                        onClick={() => handlePublishJob(jobModal.id)}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                      >
                        Publicar en el tablero
                      </button>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// --- SUBCOMPONENTES ---

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        cotizacion: 'bg-amber-100 text-amber-800 border-amber-200',
        completado: 'bg-green-100 text-green-700 border-green-200',
        pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        aceptado: 'bg-blue-100 text-blue-700 border-blue-200',
        cancelado: 'bg-red-50 text-red-600 border-red-100',
        revision_cliente: 'bg-purple-100 text-purple-700 border-purple-200',
        cancelado_incidencia: 'bg-red-50 text-red-600 border-red-100',
    };
    
    const currentStyle = styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${currentStyle}`}>
            {status === 'cotizacion' && <FaInbox/>}
            {status === 'completado' && <FaCheckCircle/>}
            {status === 'pendiente' && <FaClock/>}
            {status === 'aceptado' && <FaClock/>}
            {status === 'revision_cliente' && <FaExclamationCircle/>}
            {status}
        </span>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <FaSearch className="text-4xl mb-3 opacity-20" />
            <p className="text-sm font-medium">{text}</p>
        </div>
    );
}
'use client';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaMapMarkerAlt, FaPhone, FaSave, FaCamera, FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUI } from '../../context/UIContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function ConfiguracionMontadorPage() {
    const { userProfile, updateProfilePhoto, updateProfileData, accessToken } = useUI();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'perfil' | 'trabajo' | 'seguridad'>('perfil');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Estados para la contraseña
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        zona_servicio: '',
    });

    // --- 1. SINCRONIZAR CON EL CONTEXTO ---
    useEffect(() => {
        if (userProfile && userProfile.tipo === 'montador') {
            setFormData({ 
                nombre: userProfile.nombre || '', 
                telefono: userProfile.telefono || '',
                zona_servicio: userProfile.zona_servicio || '',
            });
            setLoading(false);
        } else if (!accessToken) {
            // router.push('/acceso'); // Comentado para evitar loops
            setLoading(false);
        } else if (userProfile && userProfile.tipo !== 'montador') {
            router.push('/panel-cliente');
        }
    }, [userProfile, accessToken, router]);

    // --- 2. SUBIR FOTO ---
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !accessToken) return;
        const file = e.target.files[0];
        
        setMessage({ text: 'Subiendo foto...', type: 'info' });

        const uploadData = new FormData();
        uploadData.append('imagen', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/perfil/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }, 
                body: uploadData
            });
            const data = await res.json();

            if (res.ok && data.foto_url) {
                updateProfilePhoto(data.foto_url); 
                setMessage({ text: '¡Foto actualizada!', type: 'success' });
            } else {
                throw new Error(data.error || 'Error al subir');
            }
        } catch (error: any) {
            setMessage({ text: 'Error al subir: ' + error.message, type: 'error' });
        } finally {
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    // --- 3. GUARDAR PERFIL (DATOS + CONTRASEÑA) ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSaving(true);
        
        // 1. Preparamos payload base
        const payload: any = {
            nombre: formData.nombre,
            telefono: formData.telefono,
            zona_servicio: formData.zona_servicio
        };

        // 2. Si hay contraseña nueva, la añadimos
        if (newPassword.trim() !== '') {
            payload.password = newPassword;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/perfil`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${accessToken}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Actualizamos contexto (sin password)
                updateProfileData({
                    nombre: formData.nombre,
                    telefono: formData.telefono,
                    zona_servicio: formData.zona_servicio
                }); 
                
                // Limpiamos campo pass
                setNewPassword('');
                
                setMessage({ text: '¡Perfil actualizado con éxito!', type: 'success' });
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Error al actualizar');
            }
        } catch (error: any) {
            setMessage({ text: 'Error: ' + error.message, type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!userProfile) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            
            <div className="max-w-2xl mx-auto px-6 pt-6 pb-2">
                    <button onClick={() => router.push('/panel-montador')} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800">
                        <FaArrowLeft /> Mis montajes
                    </button>
                    <h1 className="text-lg font-bold text-slate-800 mt-3">Zona y datos</h1>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-6">
                
                {/* TOAST DE MENSAJES */}
                {message.text && (
                    <div className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white animate-in slide-in-from-right-10 fade-in duration-300 ${message.type === 'success' ? 'bg-green-600' : message.type === 'error' ? 'bg-red-500' : 'bg-blue-600'}`}>
                        {message.type === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationTriangle size={18} />}
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    {/* ZONA DE PERFIL (HERO) */}
                    <div className="bg-slate-50 p-8 flex flex-col items-center border-b border-slate-100">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 bg-slate-900 rounded-full flex items-center justify-center p-1 shadow-md border border-slate-200 overflow-hidden">
                                {userProfile.foto_url ? (
                                    <img src={userProfile.foto_url} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400">
                                        {userProfile.nombre.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white rounded-full pointer-events-none">
                                <FaCamera size={24}/>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 border-2 border-white"
                                title="Cambiar foto"
                            >
                                <FaCamera size={14} />
                            </button>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900">{userProfile.nombre}</h2>
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-2 uppercase tracking-wide">Cuenta de montador</p>
                    </div>

                    {/* TABS DE NAVEGACIÓN */}
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('perfil')} 
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Datos
                        </button>
                        <button 
                            onClick={() => setActiveTab('trabajo')} 
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'trabajo' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Zona
                        </button>
                        <button 
                            onClick={() => setActiveTab('seguridad')} 
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'seguridad' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Seguridad
                        </button>
                    </div>

                    {/* CONTENIDO DEL FORMULARIO */}
                    <div className="p-8">
                        <form onSubmit={handleSave}>
                            
                            {/* PESTAÑA: DATOS PERSONALES */}
                            {activeTab === 'perfil' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nombre Público</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" 
                                                value={formData.nombre} 
                                                onChange={e => setFormData({...formData, nombre: e.target.value})}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium text-slate-800 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Teléfono</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="tel" 
                                                value={formData.telefono} 
                                                onChange={e => setFormData({...formData, telefono: e.target.value})}
                                                placeholder="+34 600..."
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium text-slate-800 transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email (No editable)</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="email" 
                                                value={userProfile.email} 
                                                disabled 
                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PESTAÑA: ZONA Y TRABAJO */}
                            {activeTab === 'trabajo' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-lg">Zona de Servicio</h3>
                                        <p className="text-sm text-slate-500 mb-4">Si pones tu zona, solo ves montajes publicados de esa zona. Si la dejas vacía, ves todos.</p>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500" />
                                            <input 
                                                type="text" 
                                                value={formData.zona_servicio} 
                                                onChange={e => setFormData({...formData, zona_servicio: e.target.value})}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-800 transition-all" 
                                                placeholder="Ej: Málaga Centro, Teatinos..." 
                                            />
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500">
                                        Ejemplo: Málaga o Marbella.
                                    </p>
                                </div>
                            )}

                            {/* PESTAÑA: SEGURIDAD */}
                            {activeTab === 'seguridad' && (
                                <div className="space-y-6">
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6">
                                        <div className="flex gap-3">
                                            <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                                            <p className="text-sm text-yellow-800 leading-relaxed">
                                                Si cambias tu contraseña, tendrás que volver a iniciar sesión en tus otros dispositivos.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nueva Contraseña</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium text-slate-800 transition-all" 
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 ml-1">
                                            Déjalo en blanco si no quieres cambiarla.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* BOTÓN GUARDAR (COMÚN) */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={saving || (activeTab === 'seguridad' && newPassword.length === 0)} 
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : <><FaSave /> {activeTab === 'seguridad' ? 'Actualizar Contraseña' : 'Guardar Cambios'}</>}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaCog, FaLock, FaSave, FaCamera, FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useUI, UserProfile } from '../../context/UIContext'; 
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function ConfiguracionClientePage() {
    const { userProfile, updateProfilePhoto, updateProfileData, accessToken } = useUI();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad'>('perfil');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nombre: '',
    });

    // --- 1. SINCRONIZAR CON EL CONTEXTO ---
    useEffect(() => {
        if (userProfile && userProfile.tipo === 'cliente') {
            setFormData({ 
                nombre: userProfile.nombre || '',
            });
            setLoading(false);
        } else if (!accessToken) {
            router.push('/acceso');
        } else if (userProfile && userProfile.tipo !== 'cliente') {
            router.push('/panel-montador');
        }
    }, [userProfile, accessToken]);

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
                setMessage({ text: '¡Foto actualizada con éxito!', type: 'success' });
            } else {
                throw new Error(data.error || 'Error al subir');
            }
        } catch (error: any) {
            setMessage({ text: 'Error al subir: ' + error.message, type: 'error' });
        } finally {
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    // --- 3. GUARDAR PERFIL ---
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSaving(true);
        
        const payload: Partial<UserProfile> = {
            nombre: formData.nombre,
        };

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
                updateProfileData(payload); 
                setMessage({ text: '¡Datos guardados correctamente!', type: 'success' });
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Error al guardar');
            }
        } catch (error: any) {
            setMessage({ text: 'Error: ' + error.message, type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    if (loading || !userProfile) return <div className="flex justify-center items-center h-screen bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            
            {/* Header simple con botón volver */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">Ajustes de Cuenta</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                
                {/* TOAST DE MENSAJES (FLOTANTE) */}
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
                            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center p-1 shadow-md border border-slate-200 overflow-hidden">
                                {userProfile.foto_url ? (
                                    <img src={userProfile.foto_url} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl font-bold text-slate-300">
                                        {userProfile.nombre.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 border-2 border-white"
                                title="Cambiar foto"
                            >
                                <FaCamera size={14} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-slate-900">{userProfile.nombre}</h2>
                        <p className="text-sm text-slate-500">{userProfile.email}</p>
                    </div>

                    {/* TABS DE NAVEGACIÓN INTERNA */}
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('perfil')} 
                            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Mis Datos
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
                        {activeTab === 'perfil' && (
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={formData.nombre} 
                                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium text-slate-800 transition-all" 
                                            placeholder="Tu nombre"
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

                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={saving} 
                                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : <><FaSave /> Guardar Cambios</>}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'seguridad' && (
                            <div className="space-y-6 text-center py-4">
                                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <FaLock className="text-yellow-500 text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Cambiar Contraseña</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                    Para proteger tu cuenta, te enviaremos un enlace seguro a tu correo electrónico para restablecer tu contraseña.
                                </p>
                                <button className="px-8 py-3 bg-yellow-100 text-yellow-700 font-bold rounded-xl hover:bg-yellow-200 transition-colors">
                                    Enviar Email de Recuperación
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
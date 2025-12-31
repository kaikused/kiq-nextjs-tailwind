'use client';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaCog, FaLock, FaSave, FaCamera, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
// Importamos el contexto completo para leer datos y actualizar la foto
import { useUI, UserProfile } from '../../context/UIContext'; 
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function ConfiguracionClientePage() {
    // Leemos el perfil y las funciones de actualización del Contexto
    const { userProfile, updateProfilePhoto, updateProfileData, accessToken } = useUI();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad'>('perfil');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false); // Estado para el botón de guardar
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Referencia para el input de archivo invisible
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Datos del Formulario
    const [formData, setFormData] = useState({
        nombre: '',
    });
    
    // Datos Password (Placeholder para futura implementación)
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

    // --- 1. SINCRONIZAR CON EL CONTEXTO (Lee userProfile en lugar de hacer fetch) ---
    useEffect(() => {
        if (userProfile && userProfile.tipo === 'cliente') {
            // Rellenamos el formulario con los datos del Contexto
            setFormData({ 
                nombre: userProfile.nombre || '',
            });
            setLoading(false);
        } else if (!accessToken) {
            // Si no hay token, redirigimos
            router.push('/acceso');
        } else if (userProfile && userProfile.tipo !== 'cliente') {
            // Si el perfil es de montador, redirigimos por seguridad
            router.push('/panel-montador');
        }
    }, [userProfile, accessToken]);

    // --- 2. SUBIR FOTO (ACTUALIZA BACKEND Y CONTEXTO) ---
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !accessToken) return;
        
        const file = e.target.files[0];
        
        setMessage({ text: 'Subiendo foto...', type: 'info' });

        const uploadData = new FormData();
        // CRÍTICO: El nombre de campo debe ser 'imagen' para el backend
        uploadData.append('imagen', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/perfil/foto`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }, 
                body: uploadData
            });
            const data = await res.json();

            if (res.ok && data.foto_url) {
                // 1. CRÍTICO: Actualizar el Contexto Global (para que la Cabecera sea reactiva)
                updateProfilePhoto(data.foto_url); 
                setMessage({ text: '¡Foto actualizada con éxito!', type: 'success' });
            } else {
                throw new Error(data.error || 'Error al subir');
            }
        } catch (error: any) {
            setMessage({ text: 'Error al subir: ' + error.message, type: 'error' });
        }
    };

    // --- 3. GUARDAR DATOS DE TEXTO (PUT) ---
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
                body: JSON.stringify(payload) // Solo enviamos lo editable
            });

            if (res.ok) {
                // CRÍTICO: Actualizar el Contexto con los nuevos datos (userProfile)
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
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        }
    };

    if (loading || !userProfile) return <div className="flex justify-center items-center h-screen bg-gray-50">Cargando tus datos...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
          <div className="max-w-2xl mx-auto px-5 py-8">
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <FaCog className="text-indigo-600"/> Ajustes de Cuenta
            </h1>

            {/* TABS */}
            <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-200/50 p-1 rounded-2xl">
                <button onClick={() => setActiveTab('perfil')} className={`py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Mis Datos</button>
                <button onClick={() => setActiveTab('seguridad')} className={`py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'seguridad' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Seguridad</button>
            </div>

            {/* FEEDBACK MSG */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                
                {/* FORMULARIO PERFIL */}
                {activeTab === 'perfil' && (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        
                        {/* AVATAR + SUBIDA */}
                        <div className="flex flex-col items-center mb-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()} 
                                className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-300 relative group cursor-pointer overflow-hidden border-4 border-white shadow-sm"
                            >
                                {/* Muestra la foto desde el userProfile del Contexto */}
                                {userProfile.foto_url ? (
                                    <img src={userProfile.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    userProfile.nombre.charAt(0).toUpperCase()
                                )}
                                
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                                    <FaCamera />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handlePhotoUpload} 
                            />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-indigo-500 font-bold mt-2 hover:underline">
                                Cambiar foto
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre Completo</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full pl-11 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-800" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                                {/* Usamos el email directamente del Contexto (es inmutable) */}
                                <input type="email" value={userProfile.email} disabled className="w-full pl-11 p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                            </div>
                        </div>

                        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex justify-center items-center gap-2">
                            {saving ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                        </button>
                    </form>
                )}

                {/* FORMULARIO SEGURIDAD (Simulado por ahora, funcional visualmente) */}
                {activeTab === 'seguridad' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-200">
                            Por seguridad, para cambiar tu contraseña te enviaremos un email de confirmación.
                        </div>
                        <button disabled className="w-full bg-gray-200 text-gray-500 py-3.5 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                            <FaLock/> Solicitar Cambio de Contraseña
                        </button>
                    </div>
                )}

            </div>
          </div>
        </div>
    );
}
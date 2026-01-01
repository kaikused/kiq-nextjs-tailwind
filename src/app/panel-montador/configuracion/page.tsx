'use client';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaMapMarkerAlt, FaPhone, FaSave, FaTruck, FaClock, FaCamera, FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaToggleOn } from 'react-icons/fa';
// Importamos el contexto completo para leer datos y actualizar la foto
import { useUI, UserProfile } from '../../context/UIContext'; 
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function ConfiguracionMontadorPage() {
    // Leemos el perfil y las funciones de actualización del Contexto
    const { userProfile, updateProfilePhoto, updateProfileData, handleLogout, accessToken } = useUI();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'perfil' | 'trabajo'>('perfil');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Datos Unificados del Montador (Estado local para el formulario)
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        zona_servicio: '',
    });

    // --- 1. SINCRONIZAR CON EL CONTEXTO ---
    useEffect(() => {
        if (userProfile && userProfile.tipo === 'montador') {
            // Rellenamos el formulario con los datos del Contexto
            setFormData({ 
                nombre: userProfile.nombre || '', 
                telefono: userProfile.telefono || '',
                zona_servicio: userProfile.zona_servicio || '',
            });
            setLoading(false);
        } else if (!accessToken) {
            // Si no hay token, redirigimos
            router.push('/acceso');
        } else if (userProfile && userProfile.tipo !== 'montador') {
             // Si el perfil es de cliente, redirigimos por seguridad
            router.push('/panel-cliente');
        }
    }, [userProfile, accessToken]);

    // --- 2. SUBIR FOTO (ACTUALIZA BACKEND Y CONTEXTO) ---
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !accessToken) return;
        const file = e.target.files[0];
        
        setMessage({ text: 'Subiendo foto...', type: 'info' });

        const uploadData = new FormData();
        uploadData.append('imagen', file); // CRÍTICO: El nombre de campo es 'imagen'

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
                // 2. Actualizar la vista local del formulario
                setMessage({ text: '¡Foto actualizada!', type: 'success' });
            } else {
                throw new Error(data.error || 'Error al subir');
            }
        } catch (error: any) {
            setMessage({ text: 'Error al subir: ' + error.message, type: 'error' });
        }
    };

    // --- 3. GUARDAR DATOS DE TEXTO (PUT) ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSaving(true);
        
        const payload: Partial<UserProfile> = {
            nombre: formData.nombre,
            telefono: formData.telefono,
            zona_servicio: formData.zona_servicio
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
                // CRÍTICO: Actualizar el Contexto con los nuevos datos (userProfile)
                updateProfileData(payload); 
                setMessage({ text: '¡Perfil actualizado con éxito!', type: 'success' });
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Error al actualizar');
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
                <FaUser className="text-indigo-600"/> Mi Perfil Profesional
            </h1>

            {/* TABS */}
            <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-200/50 p-1 rounded-2xl">
                <button onClick={() => setActiveTab('perfil')} className={`py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'perfil' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Datos Personales</button>
                <button onClick={() => setActiveTab('trabajo')} className={`py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'trabajo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Zona y Trabajo</button>
            </div>

            {/* FEEDBACK MSG */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    {message.text}
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <form onSubmit={handleSave}>
                    
                    {/* PESTAÑA: DATOS PERSONALES */}
                    {activeTab === 'perfil' && (
                        <div className="space-y-6">
                            {/* Foto Avatar */}
                            <div className="flex flex-col items-center mb-6">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center text-3xl font-bold text-white relative group cursor-pointer overflow-hidden shadow-lg border-4 border-white"
                                >
                                    {/* Muestra la foto del Contexto */}
                                    {userProfile.foto_url ? (
                                        <img src={userProfile.foto_url} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        userProfile.nombre.charAt(0).toUpperCase()
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs text-center px-1">
                                        <FaCamera size={20}/>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                <p className="text-xs text-gray-400 mt-2">Foto visible para clientes</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Público</label>
                                <div className="relative">
                                    <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                                    <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                                        className="w-full pl-11 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-800" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-4 top-3.5 text-gray-400" />
                                    <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})}
                                        placeholder="+34 600..."
                                        className="w-full pl-11 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-800" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email (No editable)</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                                    <input type="email" value={userProfile.email} disabled
                                        className="w-full pl-11 p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA: ZONA Y TRABAJO */}
                    {activeTab === 'trabajo' && (
                        <div className="space-y-8">
                            {/* Zona */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FaMapMarkerAlt className="text-red-500"/> Zona de Servicio</h3>
                                <p className="text-xs text-gray-500 mb-3">Define dónde quieres recibir trabajos (Ej: Málaga Centro, Teatinos).</p>
                                <input type="text" value={formData.zona_servicio} onChange={e => setFormData({...formData, zona_servicio: e.target.value})}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-800" 
                                    placeholder="Escribe tu ciudad o zonas..." />
                            </div>

                            {/* Disponibilidad (Visual) */}
                            <div className="opacity-60">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><FaClock className="text-blue-500"/> Disponibilidad</h3>
                                <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 text-sm text-gray-500">
                                    Próximamente podrás gestionar tu calendario.
                                </div>
                            </div>

                            {/* Notificaciones */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FaTruck className="text-green-600"/> Alertas de Trabajo</h3>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Nuevos Clientes</p>
                                        <p className="text-xs text-gray-500">Email cuando haya un trabajo en tu zona.</p>
                                    </div>
                                    <FaToggleOn size={28} className="text-green-500"/>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botón Guardar */}
                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center gap-2">
                            {saving ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                        </button>
                    </div>

                </form>
            </div>
          </div>
        </div>
    );
}
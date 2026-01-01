'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Importamos useUI y la interface UserProfile para tipado
import { useUI, UserProfile } from '../context/UIContext';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

/**
 * Función auxiliar que centraliza la obtención del perfil completo después del login/registro.
 * Es crucial para que la cabecera obtenga las gemas y la foto_url inmediatamente.
 */
const getFullProfileAndLogin = async (token: string, tipoUsuario: 'cliente' | 'montador', handleSuccessfulLogin: (token: string, profileData: UserProfile, gems: number) => void) => {
    // 1. Guardar token temporalmente bajo la clave correcta
    localStorage.setItem('accessToken', token); 
    
    // 2. Llamada a /api/perfil para obtener todos los datos
    const profileRes = await fetch(`${API_BASE_URL}/api/perfil`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    const profileData = await profileRes.json();
    
    if (!profileRes.ok || !profileData) {
        localStorage.removeItem('accessToken');
        throw new Error(profileData.error || 'Fallo al cargar perfil tras login/registro.');
    }

    // 3. Mapear datos para el Contexto (CRÍTICO: Añadimos bono_entregado)
    const userProfileData: UserProfile = {
        id: profileData.id,
        nombre: profileData.nombre,
        email: profileData.email,
        tipo: profileData.tipo,
        foto_url: profileData.foto_url,
        
        // --- INYECCIÓN DE LA BANDERA DE BIENVENIDA ---
        bono_entregado: profileData.bono_entregado, 

        // Añadir propiedades específicas de montador
        stripe_boarding_completado: profileData.stripe_boarding_completado,
        stripe_account_id: profileData.stripe_account_id,
        telefono: profileData.telefono,
        zona_servicio: profileData.zona_servicio
    };

    // 4. Notificar al Contexto (Guarda token en localStorage y estado en React)
    handleSuccessfulLogin(token, userProfileData, profileData.gemas || 0);

    // 5. Determinar la ruta de redirección
    if (tipoUsuario === 'cliente') {
        return '/panel-cliente';
    } else if (tipoUsuario === 'montador') {
        return '/panel-montador';
    }
    return '/';
};


export default function RegisterModal() {
    // Extraemos la función handleSuccessfulLogin del Contexto (CRÍTICO)
    const { isRegisterModalOpen, closeModals, openLoginModal, handleSuccessfulLogin } = useUI();
    
    // Estados del formulario
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [zonaServicio, setZonaServicio] = useState('');
    
    // Estado de verificación
    const [verificationCode, setVerificationCode] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // --- PASO 1: SOLICITAR CÓDIGO ---
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (data.status === 'registrado') {
                setError(data.message); 
            } else if (data.status === 'enviado') {
                setStep(2); // AVANZAMOS AL PASO 2
            } else {
                throw new Error(data.error || "Error al conectar con el servidor");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- PASO 2: REGISTRO FINAL CON CÓDIGO ---
    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        let redirectPath = '/';

        try {
            // 1. Llamada al endpoint de registro (Montador)
            const res = await fetch(`${API_BASE_URL}/api/montador/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre, 
                    email, 
                    password, 
                    telefono, 
                    zona_servicio: zonaServicio,
                    codigo: verificationCode 
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error en el registro');
            
            const token = data.access_token;
            if (!token) throw new Error("No se recibió token del servidor");

            // 2. OBTENER PERFIL COMPLETO, GEMAS Y SINCRONIZAR CON CONTEXTO (CRÍTICO)
            // Pasamos handleSuccessfulLogin como argumento para usarlo dentro de la auxiliar.
            redirectPath = await getFullProfileAndLogin(token, 'montador', handleSuccessfulLogin); 
            
            // 3. Redireccionar
            router.push(redirectPath);

        } catch (err: any) {
            setError(err.message);
            // Limpiamos el token si falló la carga del perfil
            localStorage.removeItem('accessToken'); 
        } finally {
            setIsLoading(false);
        }
    };

    const switchToLogin = () => {
        closeModals();
        openLoginModal();
    };

    if (!isRegisterModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            
            {/* Cabecera Morada */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 p-6 text-center sticky top-0 z-10">
                
                {/* Botón Volver (Solo en paso 2) */}
                {step === 2 && (
                    <button 
                        onClick={() => setStep(1)}
                        className="absolute top-6 left-4 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    >
                        <FaArrowLeft /> Volver
                    </button>
                )}

                <h2 className="text-2xl font-bold text-white">
                    {step === 1 ? "Únete al Equipo" : "Verifica tu Correo"}
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                    {step === 1 ? "Empieza a ganar dinero montando muebles" : `Hemos enviado un código a ${email}`}
                </p>
                
                <button 
                    onClick={closeModals}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <div className="p-8">
                
                {/* --- FORMULARIO PASO 1: DATOS --- */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
                            <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 outline-none transition-all" />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 outline-none transition-all" />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
                            <input type="password" placeholder="Contraseña segura" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 outline-none transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaPhone /></div>
                                <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 outline-none transition-all" />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaMapMarkerAlt /></div>
                                <input type="text" placeholder="Zona (ej: Málaga)" value={zonaServicio} onChange={(e) => setZonaServicio(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 outline-none transition-all" />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">{error}</div>}

                        <button type="submit" disabled={isLoading}
                            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Continuar'}
                        </button>
                    </form>
                )}

                {/* --- FORMULARIO PASO 2: CÓDIGO --- */}
                {step === 2 && (
                    <form onSubmit={handleFinalRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                                <FaShieldAlt size={24} />
                            </div>
                            <p className="text-gray-600 text-sm">
                                Por seguridad, introduce el código de 6 dígitos que acabamos de enviar a <strong>{email}</strong>.
                            </p>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="123456" 
                                value={verificationCode} 
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,'').slice(0,6))} 
                                required
                                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none transition-all" 
                            />
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">{error}</div>}

                        <button type="submit" disabled={isLoading || verificationCode.length < 6}
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verificando...' : 'Confirmar y Crear Cuenta'}
                        </button>
                        
                        <p className="text-center text-xs text-gray-400">
                            ¿No recibiste el código? <button type="button" onClick={() => setStep(1)} className="text-purple-600 hover:underline">Reintentar</button>
                        </p>
                    </form>
                )}

                <div className="mt-6 text-center border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <button onClick={switchToLogin} className="font-bold text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                        Inicia sesión
                        </button>
                    </p>
                </div>
            </div>
          </div>
        </div>
    );
}
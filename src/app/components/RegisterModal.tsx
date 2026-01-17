'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUI, UserProfile } from '../context/UIContext';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

const getFullProfileAndLogin = async (token: string, tipoUsuario: 'cliente' | 'montador', handleSuccessfulLogin: (token: string, profileData: UserProfile, gems: number) => void) => {
    localStorage.setItem('accessToken', token); 
    
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

    const userProfileData: UserProfile = {
        id: profileData.id,
        nombre: profileData.nombre,
        email: profileData.email,
        tipo: profileData.tipo,
        foto_url: profileData.foto_url,
        bono_entregado: profileData.bono_entregado, 
        stripe_boarding_completado: profileData.stripe_boarding_completado,
        stripe_account_id: profileData.stripe_account_id,
        telefono: profileData.telefono,
        zona_servicio: profileData.zona_servicio
    };

    handleSuccessfulLogin(token, userProfileData, profileData.gemas || 0);

    if (tipoUsuario === 'cliente') return '/panel-cliente';
    if (tipoUsuario === 'montador') return '/panel-montador';
    return '/';
};

export default function RegisterModal() {
    const { isRegisterModalOpen, closeModals, openLoginModal, handleSuccessfulLogin } = useUI();
    const router = useRouter();
    
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [zonaServicio, setZonaServicio] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
                setStep(2); 
            } else {
                throw new Error(data.error || "Error al conectar con el servidor");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
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

            const redirectPath = await getFullProfileAndLogin(token, 'montador', handleSuccessfulLogin); 
            
            closeModals();
            router.push(redirectPath);

        } catch (err: any) {
            setError(err.message);
            localStorage.removeItem('accessToken'); 
        } finally {
            setIsLoading(false);
        }
    };

    const switchToLogin = () => {
        closeModals();
        openLoginModal();
    };

    // 🔥 IMPORTANTE: Si está cerrado, no renderizamos nada.
    if (!isRegisterModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto ring-1 ring-gray-200">
            
            {/* Cabecera Gradient Morada (Igual que LoginModal) */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center sticky top-0 z-10">
                
                {/* Botón Volver */}
                {step === 2 && (
                    <button 
                        onClick={() => setStep(1)}
                        className="absolute top-8 left-6 text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20"
                    >
                        <FaArrowLeft /> Volver
                    </button>
                )}

                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {step === 1 ? "Únete al Equipo Kiq" : "Verifica tu Correo"}
                </h2>
                <p className="text-indigo-100 text-sm mt-2 font-medium">
                    {step === 1 ? "Empieza a ganar dinero montando muebles" : `Hemos enviado un código a ${email}`}
                </p>
                
                <button 
                    onClick={closeModals}
                    className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    aria-label="Cerrar registro"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            <div className="p-8 pt-6">
                
                {/* --- FORMULARIO PASO 1 --- */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors"><FaUser /></div>
                            <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium" />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors"><FaEnvelope /></div>
                            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium" />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors"><FaLock /></div>
                            <input type="password" placeholder="Contraseña segura (min. 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors"><FaPhone /></div>
                                <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium" />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors"><FaMapMarkerAlt /></div>
                                <input type="text" placeholder="Zona (ej: Málaga)" value={zonaServicio} onChange={(e) => setZonaServicio(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium" />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center font-bold animate-pulse">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Enviando Código...
                                </span>
                            ) : 'Continuar'}
                        </button>
                    </form>
                )}

                {/* --- FORMULARIO PASO 2 --- */}
                {step === 2 && (
                    <form onSubmit={handleFinalRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-2 animate-bounce">
                                <FaShieldAlt size={32} />
                            </div>
                            <p className="text-gray-600 text-sm px-4 leading-relaxed">
                                Por seguridad, introduce el código de 6 dígitos que acabamos de enviar a <strong className="text-gray-900">{email}</strong>.
                            </p>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="000000" 
                                maxLength={6}
                                value={verificationCode} 
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,'').slice(0,6))} 
                                required
                                autoFocus
                                className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-800 placeholder-gray-300" 
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center font-bold">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading || verificationCode.length < 6}
                            className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Verificando...
                                </span>
                            ) : 'Confirmar y Crear Cuenta'}
                        </button>
                        
                        <p className="text-center text-xs text-gray-500 mt-4">
                            ¿No recibiste el código? <button type="button" onClick={() => setStep(1)} className="text-purple-600 hover:underline font-bold ml-1">Reintentar</button>
                        </p>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <button 
                            onClick={switchToLogin}
                            className="font-bold text-purple-600 hover:text-purple-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>
            </div>
          </div>
        </div>
    );
}
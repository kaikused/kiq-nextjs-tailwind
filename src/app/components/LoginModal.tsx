'use client';
import { useState, useEffect, useRef } from 'react'; // Añadido useRef y useEffect para foco
import { useUI, UserProfile } from '../context/UIContext';
import { FaTimes, FaEnvelope, FaLock } from 'react-icons/fa';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function LoginModal() {
    const { isLoginModalOpen, closeModals, openRegisterModal, handleSuccessfulLogin, openRecoveryModal } = useUI();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Referencia para gestionar el foco al abrir el modal (UX de primera clase)
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Efecto para poner el foco en el email al abrir
    useEffect(() => {
        if (isLoginModalOpen && emailInputRef.current) {
            // Pequeño timeout para asegurar que la animación ha empezado
            setTimeout(() => emailInputRef.current?.focus(), 100);
        }
    }, [isLoginModalOpen]);

    // --- Función Auxiliar para obtener perfil completo ---
    const getFullProfileAndLogin = async (token: string, tipoUsuario: 'cliente' | 'montador') => {
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
            throw new Error(profileData.error || 'No se pudo cargar el perfil.');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const loginRes = await fetch(`${API_BASE_URL}/api/login-universal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                throw new Error(loginData.message || 'Credenciales incorrectas');
            }

            const token = loginData.token;
            const tipoUsuario = loginData.role as 'cliente' | 'montador';

            if (!token || !tipoUsuario) {
                throw new Error("Error de conexión con el servidor.");
            }
            
            const redirectPath = await getFullProfileAndLogin(token, tipoUsuario);
            window.location.href = redirectPath;

        } catch (err: any) {
            setIsLoading(false);
            localStorage.removeItem('accessToken'); 
            setError(err.message);
        }
    };

    const switchToRegister = () => {
        closeModals();
        openRegisterModal();
    };

    const switchToRecovery = () => {
        openRecoveryModal(); 
    };

    if (!isLoginModalOpen) return null;

    return (
        // Overlay con backdrop-blur para efecto moderno
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity">
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-gray-200">
            
            {/* Cabecera Gradient */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center relative overflow-hidden">
                {/* Decoración de fondo sutil */}
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="relative z-10">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">¡Hola de nuevo! 👋</h2>
                    <p className="text-indigo-100 text-sm mt-2 font-medium">Ingresa a tu cuenta para continuar</p>
                </div>
                
                <button 
                    onClick={closeModals}
                    aria-label="Cerrar ventana de inicio de sesión" // ACCESIBILIDAD CRÍTICA
                    className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            <div className="p-8 pt-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <FaEnvelope />
                    </div>
                    <input
                        ref={emailInputRef} // FOCO AUTOMÁTICO
                        id="login-email"
                        type="email"
                        name="email" // Ayuda al autocompletado
                        autoComplete="email" // Ayuda al navegador
                        aria-label="Correo electrónico" // ACCESIBILIDAD
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium"
                    />
                </div>

                {/* Password */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <FaLock />
                    </div>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        aria-label="Contraseña"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium"
                    />
                </div>

                {/* Link Olvidé Contraseña */}
                <div className="flex justify-end">
                    <button 
                        type="button"
                        onClick={switchToRecovery}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                        <span className="font-bold">Error:</span> {error}
                    </div>
                )}

                {/* Botón Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Validando...
                        </span>
                    ) : 'Iniciar Sesión'}
                </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                    ¿Aún no tienes cuenta?{' '}
                    <button 
                    onClick={switchToRegister}
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded px-1"
                    >
                    Regístrate gratis
                    </button>
                </p>
                </div>
            </div>
          </div>
        </div>
    );
}
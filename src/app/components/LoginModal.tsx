'use client';
import { useState, useEffect, useRef } from 'react'; // Añadido useRef y useEffect para foco
import { useUI, UserProfile } from '../context/UIContext';
import { FaTimes } from 'react-icons/fa';

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
        openRegisterModal('cliente');
    };

    const switchToRecovery = () => {
        openRecoveryModal(); 
    };

    if (!isLoginModalOpen) return null;

    const fieldClass =
        'w-full min-h-12 rounded-full bg-slate-50 px-5 py-3 text-[16px] text-slate-900 placeholder:text-slate-500 ring-1 ring-inset ring-slate-200 outline-none focus:ring-2 focus:ring-slate-400';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between bg-slate-950 px-5 py-4">
                    <h2 className="font-titulo text-lg font-bold text-white">Entrar</h2>
                    <button
                        type="button"
                        onClick={closeModals}
                        aria-label="Cerrar ventana de inicio de sesión"
                        className="rounded-full p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="px-5 pb-7 pt-6 sm:px-7">
                    <p className="mb-6 text-sm text-slate-600">
                        Cuenta de cliente o montador.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <label htmlFor="login-email" className="sr-only">
                            Correo electrónico
                        </label>
                        <input
                            ref={emailInputRef}
                            id="login-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            aria-label="Correo electrónico"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={fieldClass}
                        />

                        <label htmlFor="login-password" className="sr-only">
                            Contraseña
                        </label>
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
                            className={fieldClass}
                        />

                        <div className="flex justify-end px-1">
                            <button
                                type="button"
                                onClick={switchToRecovery}
                                className="min-h-11 text-sm font-medium text-slate-500 hover:text-slate-900 focus:outline-none"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {error && (
                            <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700 ring-1 ring-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-4 text-base font-semibold text-white hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Validando…' : 'Entrar'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        ¿Aún no tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={switchToRegister}
                            className="font-semibold text-slate-950 hover:underline focus:outline-none"
                        >
                            Regístrate
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
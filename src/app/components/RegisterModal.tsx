'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUI, UserProfile } from '../context/UIContext';
import { nombreCompletoValido, telefonoValido } from '../lib/registro';
import { FaTimes } from 'react-icons/fa';

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
    const { isRegisterModalOpen, closeModals, openLoginModal, handleSuccessfulLogin, registerRole } = useUI();
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

    useEffect(() => {
        if (!isRegisterModalOpen) return;
        setStep(1);
        setError('');
        setVerificationCode('');
        setIsLoading(false);
    }, [isRegisterModalOpen]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        if (!nombreCompletoValido(nombre)) {
            setError("Escribe nombre y apellidos.");
            setIsLoading(false);
            return;
        }
        if (!telefonoValido(telefono)) {
            setError("El teléfono es obligatorio (mínimo 9 dígitos).");
            setIsLoading(false);
            return;
        }
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
            const endpoint = registerRole === 'cliente' ? '/api/cliente/registro' : '/api/montador/registro';
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

            const redirectPath = await getFullProfileAndLogin(token, registerRole, handleSuccessfulLogin); 
            
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

    const fieldClass =
        'w-full min-h-12 rounded-full bg-slate-50 px-5 py-3 text-[16px] text-slate-900 placeholder:text-slate-500 ring-1 ring-inset ring-slate-200 outline-none focus:ring-2 focus:ring-slate-400';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div
                className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between bg-slate-950 px-5 py-4">
                    <h2 className="font-titulo text-lg font-bold text-white">
                        {step === 1
                            ? (registerRole === 'cliente' ? 'Crea tu cuenta' : 'Únete al equipo Kiq')
                            : 'Verifica tu correo'}
                    </h2>
                    <button
                        type="button"
                        onClick={closeModals}
                        className="rounded-full p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
                        aria-label="Cerrar registro"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 pb-7 pt-6 sm:px-7">
                    <p className="mb-6 text-sm text-slate-600">
                        {step === 1
                            ? (registerRole === 'cliente'
                                ? 'Nombre, apellidos, teléfono y correo.'
                                : 'Empieza a recibir montajes en tu zona.')
                            : `Código enviado a ${email}.`}
                    </p>

                    {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-3">
                        <label htmlFor="register-nombre" className="sr-only">Nombre y apellidos</label>
                        <input
                            id="register-nombre"
                            type="text"
                            placeholder="Nombre y apellidos"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            className={fieldClass}
                        />
                        <label htmlFor="register-email" className="sr-only">Correo electrónico</label>
                        <input
                            id="register-email"
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={fieldClass}
                        />
                        <label htmlFor="register-password" className="sr-only">Contraseña</label>
                        <input
                            id="register-password"
                            type="password"
                            placeholder="Contraseña (mín. 8 caracteres)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={fieldClass}
                        />
                        <label htmlFor="register-telefono" className="sr-only">Teléfono</label>
                        <input
                            id="register-telefono"
                            type="tel"
                            placeholder="Teléfono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            required
                            className={fieldClass}
                        />
                        {registerRole === 'montador' && (
                            <>
                                <label htmlFor="register-zona" className="sr-only">Zona</label>
                                <input
                                    id="register-zona"
                                    type="text"
                                    placeholder="Zona (ej: Málaga)"
                                    value={zonaServicio}
                                    onChange={(e) => setZonaServicio(e.target.value)}
                                    className={fieldClass}
                                />
                            </>
                        )}

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
                            {isLoading ? 'Enviando…' : 'Continuar'}
                        </button>
                    </form>
                    )}

                    {step === 2 && (
                    <form onSubmit={handleFinalRegister} className="space-y-4">
                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(''); }}
                            className="text-sm font-medium text-slate-500 hover:text-slate-900"
                        >
                            Volver
                        </button>
                        <label htmlFor="register-code" className="sr-only">Código de 6 dígitos</label>
                        <input
                            id="register-code"
                            type="text"
                            inputMode="numeric"
                            placeholder="000000"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            autoFocus
                            className="w-full min-h-14 rounded-2xl bg-slate-50 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-slate-900 outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-slate-400"
                        />

                        {error && (
                            <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700 ring-1 ring-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || verificationCode.length < 6}
                            className="flex min-h-12 w-full items-center justify-center rounded-full bg-slate-950 px-4 text-base font-semibold text-white hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verificando…' : 'Crear cuenta'}
                        </button>
                        <p className="text-center text-xs text-slate-500">
                            ¿No llegó el código?{' '}
                            <button type="button" onClick={() => setStep(1)} className="font-semibold text-slate-950 hover:underline">
                                Reintentar
                            </button>
                        </p>
                    </form>
                    )}

                    <p className="mt-6 text-center text-sm text-slate-500">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={switchToLogin}
                            className="font-semibold text-slate-950 hover:underline focus:outline-none"
                        >
                            Entrar
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
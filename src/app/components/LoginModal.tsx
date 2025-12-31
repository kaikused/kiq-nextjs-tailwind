'use client';
import { useState } from 'react';
import { useUI, UserProfile } from '../context/UIContext';
import { FaTimes, FaEnvelope, FaLock } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function LoginModal() {
    // Extraemos las funciones del Contexto
    const { isLoginModalOpen, closeModals, openRegisterModal, handleSuccessfulLogin } = useUI();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Función Auxiliar para obtener perfil completo ---
    const getFullProfileAndLogin = async (token: string, tipoUsuario: 'cliente' | 'montador') => {
        // 1. Guardar token temporalmente
        localStorage.setItem('accessToken', token); 
        
        // 2. Obtener datos completos del perfil
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

        // 3. Mapear datos para el Contexto
        const userProfileData: UserProfile = {
            id: profileData.id,
            nombre: profileData.nombre,
            email: profileData.email,
            tipo: profileData.tipo,
            foto_url: profileData.foto_url,
            bono_entregado: profileData.bono_entregado, // <--- IMPORTANTE: Bandera de bienvenida
            stripe_boarding_completado: profileData.stripe_boarding_completado,
            stripe_account_id: profileData.stripe_account_id,
            telefono: profileData.telefono,
            zona_servicio: profileData.zona_servicio
        };

        // 4. Actualizar Contexto Global
        handleSuccessfulLogin(token, userProfileData, profileData.gemas || 0);

        // 5. Retornar ruta de redirección
        if (tipoUsuario === 'cliente') return '/panel-cliente';
        if (tipoUsuario === 'montador') return '/panel-montador';
        return '/';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Petición de Login
            const loginRes = await fetch(`${API_BASE_URL}/api/login-universal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                // Si borraste el usuario, aquí caerá el error 401
                throw new Error(loginData.error || 'Credenciales incorrectas');
            }

            const token = loginData.access_token;
            const tipoUsuario = loginData.tipo_usuario as 'cliente' | 'montador';

            if (!token || !tipoUsuario) {
                throw new Error("Error de conexión con el servidor.");
            }
            
            // 2. Obtener perfil y sincronizar
            const redirectPath = await getFullProfileAndLogin(token, tipoUsuario);
            
            // 3. Redirigir
            window.location.href = redirectPath;

        } catch (err: any) {
            setIsLoading(false);
            localStorage.removeItem('accessToken'); 
            setError(err.message); // Esto mostrará el mensaje rojo en el modal
        }
    };

    const switchToRegister = () => {
        closeModals();
        openRegisterModal();
    };

    if (!isLoginModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          
          {/* Modal con diseño original intacto */}
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Cabecera Gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-center">
                <h2 className="text-2xl font-bold text-white">¡Bienvenido de nuevo!</h2>
                <p className="text-indigo-100 text-sm mt-1">Ingresa a tu cuenta para continuar</p>
                
                <button 
                    onClick={closeModals}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaEnvelope />
                    </div>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
                    />
                </div>

                {/* Password */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FaLock />
                    </div>
                    <input
                        id="login-password"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800 placeholder-gray-400 font-medium"
                    />
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Entrando...
                        </span>
                    ) : 'Iniciar Sesión'}
                </button>
                </form>

                <div className="mt-6 text-center border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                    ¿Aún no tienes cuenta?{' '}
                    <button 
                    onClick={switchToRegister}
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
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
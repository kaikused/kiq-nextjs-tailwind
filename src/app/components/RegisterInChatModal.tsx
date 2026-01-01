'use client';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft, FaPaperPlane, FaCheck, FaTimes } from 'react-icons/fa';
import { useUI, UserProfile } from '../context/UIContext';
import { useRouter } from 'next/navigation';

// Define las props
interface RegisterInChatModalProps {
  isOpen: boolean;
  onClose: () => void; 
  prefilledName: string;
  registrationData: any; 
  onSuccess?: (token: string, email: string) => void;
}

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

/**
 * Función auxiliar para sincronizar perfil.
 */
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
        throw new Error(profileData.error || 'Fallo al cargar perfil tras registro.');
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

export default function RegisterInChatModal({ isOpen, onClose, prefilledName, registrationData, onSuccess }: RegisterInChatModalProps) {
  const { handleSuccessfulLogin, openLoginModal, closeModals } = useUI();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Email, 2: Código + Pass
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.status === 'registrado') {
        setError("Este email ya está registrado. Inicia sesión.");
      } else if (data.status === 'enviado') {
        setStep(2);
      } else {
        throw new Error(data.error || "Error al enviar código");
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
    let redirectPath = '/';

    try {
      const payload = {
        nombre: prefilledName,
        email,
        password,
        codigo: verificationCode,
        ...registrationData 
      };

      const res = await fetch(`${API_BASE_URL}/api/publicar-y-registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error en el registro');
      
      const token = data.access_token;
      if (!token) throw new Error("No se recibió token");

      // Sincronizamos el contexto siempre
      redirectPath = await getFullProfileAndLogin(token, 'cliente', handleSuccessfulLogin); 
      
      if (onSuccess) {
        onSuccess(token, email);
      } else {
        router.push(redirectPath);
        onClose();
      }

    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem('accessToken'); 
    } finally {
      setIsLoading(false);
    }
  };
    
  const handleSwitchToLogin = () => {
      onClose();
      openLoginModal();
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabecera Azul */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center relative">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
                <FaTimes size={20} />
            </button>

            <h3 className="text-xl font-bold text-white flex justify-center items-center gap-2">
                {step === 1 ? 'Guardar Presupuesto' : 'Seguridad'}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
                {step === 1 
                    ? `Hola ${prefilledName}, guarda tu cotización para continuar.` 
                    : `Código enviado a ${email}`
                }
            </p>
        </div>

        <div className="p-8">
            {/* Barra de Progreso */}
            <div className="h-1 w-full bg-gray-100 mb-6 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: step === 1 ? '50%' : '100%' }} 
                />
            </div>

            {/* PASO 1: EMAIL */}
            {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                            <FaEnvelope />
                        </div>
                        <input 
                            type="email" placeholder="Tu correo electrónico" 
                            value={email} onChange={(e) => setEmail(e.target.value)} 
                            required
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm" 
                        />
                    </div>

                    {error && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-medium text-center">{error}</div>}

                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                        {isLoading ? "Enviando..." : <>Continuar <FaPaperPlane size={12}/></>}
                    </button>
                    
                    <div className="mt-4 text-center">
                         <p className="text-xs text-gray-500">
                            ¿Ya tienes cuenta? <button type="button" onClick={handleSwitchToLogin} className="text-blue-600 font-bold hover:underline">Inicia Sesión</button>
                        </p>
                    </div>
                </form>
            )}

            {/* PASO 2: CÓDIGO + PASSWORD */}
            {step === 2 && (
                <form onSubmit={handleFinalRegister} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Código Visual */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Código de Verificación</label>
                        <input 
                            type="text" placeholder="000000" maxLength={6}
                            value={verificationCode} 
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,''))} 
                            required
                            autoFocus
                            className="w-full text-center text-2xl font-mono font-bold tracking-[0.5em] py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-gray-800" 
                        />
                    </div>

                    {/* Password */}
                    <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Crea una contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500"><FaLock /></div>
                            <input 
                                type="password" placeholder="Mínimo 8 caracteres" 
                                value={password} onChange={(e) => setPassword(e.target.value)} 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm" 
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-medium text-center">{error}</div>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setStep(1)} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
                            <FaArrowLeft />
                        </button>
                        <button type="submit" disabled={isLoading || verificationCode.length < 6} 
                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Creando..." : <>Finalizar y Guardar <FaCheck /></>}
                        </button>
                    </div>
                    
                    <p className="text-center text-xs text-gray-400 mt-2">
                        ¿No llegó? <button type="button" onClick={() => setStep(1)} className="text-blue-600 hover:underline font-bold">Reenviar</button>
                    </p>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
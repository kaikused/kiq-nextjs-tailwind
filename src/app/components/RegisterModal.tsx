'use client';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft, FaPaperPlane, FaCheck, FaTimes, FaPhone } from 'react-icons/fa';
import { useUI, UserProfile } from '../context/UIContext';
import { useRouter } from 'next/navigation';

interface RegisterInChatModalProps {
  isOpen: boolean; onClose: () => void; prefilledName: string; registrationData: any; onSuccess?: (token: string, email: string) => void;
}
const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

const getFullProfileAndLogin = async (token: string, tipoUsuario: 'cliente' | 'montador', handleSuccessfulLogin: (token: string, profileData: UserProfile, gems: number) => void) => {
    localStorage.setItem('accessToken', token); 
    const profileRes = await fetch(`${API_BASE_URL}/api/perfil`, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    const profileData = await profileRes.json();
    if (!profileRes.ok || !profileData) { localStorage.removeItem('accessToken'); throw new Error(profileData.error || 'Fallo al cargar perfil.'); }
    const userProfileData: UserProfile = {
        id: profileData.id, nombre: profileData.nombre, email: profileData.email, tipo: profileData.tipo, foto_url: profileData.foto_url, bono_entregado: profileData.bono_entregado, stripe_boarding_completado: profileData.stripe_boarding_completado, stripe_account_id: profileData.stripe_account_id, telefono: profileData.telefono, zona_servicio: profileData.zona_servicio
    };
    handleSuccessfulLogin(token, userProfileData, profileData.gemas || 0);
    return tipoUsuario === 'cliente' ? '/panel-cliente' : '/panel-montador';
};

export default function RegisterInChatModal({ isOpen, onClose, prefilledName, registrationData, onSuccess }: RegisterInChatModalProps) {
  const { handleSuccessfulLogin, openLoginModal, closeModals } = useUI();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(registrationData?.email || '');
  const [telefono, setTelefono] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-code`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (data.status === 'registrado') setError("Email ya registrado. Inicia sesión.");
      else if (data.status === 'enviado') setStep(2);
      else throw new Error(data.error);
    } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const payload = { nombre: prefilledName, email, password, codigo: verificationCode, telefono: telefono || registrationData.telefono, ...registrationData };
      const res = await fetch(`${API_BASE_URL}/api/publicar-y-registrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en registro');
      const redirectPath = await getFullProfileAndLogin(data.access_token, 'cliente', handleSuccessfulLogin);
      if (onSuccess) onSuccess(data.access_token, email); else { router.push(redirectPath); onClose(); }
    } catch (err: any) { setError(err.message); localStorage.removeItem('accessToken'); } finally { setIsLoading(false); }
  };
    
  const handleSwitchToLogin = () => { onClose(); openLoginModal(); }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-gray-200">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-center relative">
             <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full transition-colors"><FaTimes size={16} /></button>
            <h3 className="text-xl font-extrabold text-white flex justify-center items-center gap-2 tracking-tight">{step === 1 ? 'Guardar Presupuesto' : 'Seguridad'}</h3>
            <p className="text-indigo-100 text-sm mt-1 font-medium">{step === 1 ? `Hola ${prefilledName}, completa tus datos.` : `Código enviado a ${email}`}</p>
        </div>

        <div className="p-8 pt-6">
            <div className="h-1.5 w-full bg-gray-100 mb-8 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }} /></div>
            {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                    <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600 transition-colors"><FaEnvelope /></div><input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium text-gray-900" /></div>
                    <div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600 transition-colors"><FaPhone /></div><input type="tel" placeholder="Teléfono (Opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium text-gray-900" /></div>
                    {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-bold text-center animate-pulse">{error}</div>}
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5">{isLoading ? "Enviando..." : <>Continuar <FaPaperPlane size={12}/></>}</button>
                    <div className="mt-6 text-center pt-4 border-t border-gray-50"><p className="text-xs text-gray-500">¿Ya tienes cuenta? <button type="button" onClick={handleSwitchToLogin} className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors ml-1">Inicia Sesión</button></p></div>
                </form>
            )}
            {step === 2 && (
                <form onSubmit={handleFinalRegister} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Código de Verificación</label><input type="text" placeholder="000000" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,''))} required autoFocus className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-gray-900 transition-all" /></div>
                    <div><label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Contraseña</label><div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600 transition-colors"><FaLock /></div><input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium text-gray-900" /></div></div>
                    {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100 font-bold text-center">{error}</div>}
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(1)} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300"><FaArrowLeft /></button><button type="submit" disabled={isLoading || verificationCode.length < 6} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">{isLoading ? "Creando..." : <>Finalizar <FaCheck /></>}</button></div>
                    <p className="text-center text-xs text-gray-400 mt-2">¿No llegó? <button type="button" onClick={() => setStep(1)} className="text-indigo-600 hover:underline font-bold ml-1">Reenviar</button></p>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
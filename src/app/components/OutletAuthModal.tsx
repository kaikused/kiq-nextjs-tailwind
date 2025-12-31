'use client';
import { useState } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaUser, FaCheckCircle, FaArrowRight, FaSignInAlt } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

interface OutletAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void; // Callback para saber cuándo cerrar y proceder
}

export default function OutletAuthModal({ isOpen, onClose, onAuthSuccess }: OutletAuthModalProps) {
  const { handleSuccessfulLogin } = useUI();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Estados de Formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [code, setCode] = useState('');
  
  // Estados de Flujo
  const [step, setStep] = useState(1); // 1: Email, 2: Datos y Código (Solo registro)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // --- LÓGICA LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/login-universal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Obtenemos perfil completo tras login para el contexto
        const resPerfil = await fetch(`${API_BASE_URL}/api/perfil`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        const dataPerfil = await resPerfil.json();
        
        handleSuccessfulLogin(data.access_token, dataPerfil, dataPerfil.gemas || 0);
        onAuthSuccess();
        onClose();
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA REGISTRO (PASO 1: ENVIAR CÓDIGO) ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // Verificar si existe antes
        const checkRes = await fetch(`${API_BASE_URL}/api/check-email`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const checkData = await checkRes.json();
        
        if (checkData.status === 'existente') {
            setError('Este email ya está registrado. Por favor, inicia sesión.');
            setActiveTab('login');
            setIsLoading(false);
            return;
        }

        // Enviar código
        const res = await fetch(`${API_BASE_URL}/api/auth/send-code`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        if (res.ok) {
            setStep(2); // Avanzar al paso de completar datos
        } else {
            const data = await res.json();
            setError(data.error || 'Error al enviar código');
        }
    } catch (err) {
        setError('Error al conectar');
    } finally {
        setIsLoading(false);
    }
  };

  // --- LÓGICA REGISTRO (PASO 2: COMPLETAR) ---
  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // Usamos el NUEVO endpoint ligero
        const res = await fetch(`${API_BASE_URL}/api/auth/registro-cliente-simple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, nombre, password, codigo: code
            })
        });

        const data = await res.json();

        if (res.ok) {
             // El endpoint ya devuelve el token y el usuario básico
             // Construimos un perfil básico para el contexto inmediato
             const perfilBasico: any = {
                 id: data.user.id,
                 nombre: data.user.nombre,
                 email: email,
                 tipo: 'cliente',
                 foto_url: null
             };
             
             handleSuccessfulLogin(data.access_token, perfilBasico, 500); // 500 gemas de regalo
             onAuthSuccess();
             onClose();
        } else {
            setError(data.error || 'Error en el registro');
        }
    } catch (err) {
        setError('Error de conexión');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Cabecera con Pestañas */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'login' ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Iniciar Sesión
            </button>
            <button 
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'register' ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Crear Cuenta
            </button>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 transition">
            <FaTimes />
        </button>

        <div className="p-8">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
                    {error}
                </div>
            )}

            {/* FORMULARIO LOGIN */}
            {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                            <input type="email" required className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                            <input type="password" required className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLoading ? 'Entrando...' : <><FaSignInAlt /> Entrar</>}
                    </button>
                </form>
            )}

            {/* FORMULARIO REGISTRO */}
            {activeTab === 'register' && (
                <form onSubmit={step === 1 ? handleSendCode : handleCompleteRegister} className="space-y-4">
                    {step === 1 ? (
                        <>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">Introduce tu email para verificar tu cuenta.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                                    <input type="email" required className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                {isLoading ? 'Verificando...' : <><FaArrowRight /> Continuar</>}
                            </button>
                        </>
                    ) : (
                        <>
                             <div className="text-center mb-2">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Código enviado a {email}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu Nombre</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                                        <input type="text" required className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código</label>
                                    <input type="text" required maxLength={6} className="w-full p-3 bg-white border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500 text-center font-mono font-bold tracking-widest" placeholder="123456" value={code} onChange={e => setCode(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crea una contraseña</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                                    <input type="password" required className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                                {isLoading ? 'Creando cuenta...' : <><FaCheckCircle /> Finalizar Registro</>}
                            </button>
                        </>
                    )}
                </form>
            )}

        </div>
      </div>
    </div>
  );
}
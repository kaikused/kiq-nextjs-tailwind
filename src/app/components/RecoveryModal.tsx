'use client';
import { useState } from 'react';
// Ajustamos la ruta para salir de "components" y entrar a "context"
import { useUI } from '../context/UIContext'; 
import { FaTimes, FaEnvelope, FaKey, FaShieldAlt } from 'react-icons/fa';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function RecoveryModal() {
  const { isRecoveryModalOpen, closeModals, openLoginModal } = useUI();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isRecoveryModalOpen) return null;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep(2);
        setMessage({ type: 'success', text: 'Código enviado. Revisa tu correo.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al solicitar código' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Contraseña actualizada! Iniciando sesión...' });
        setTimeout(() => {
          closeModals();
          openLoginModal();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        
        <div className="bg-gray-900 p-6 text-center relative">
          <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Recuperar Acceso</h2>
          <p className="text-gray-400 text-sm mt-1">Restablece tu contraseña de forma segura</p>
        </div>

        <div className="p-8">
          {message.text && (
            <div className={`mb-6 p-3 rounded-lg text-sm text-center font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Tu correo registrado" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-200">
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
              <div className="relative">
                <FaShieldAlt className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Código de 6 dígitos" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none tracking-widest text-center font-mono font-bold"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required 
                />
              </div>
              <div className="relative">
                <FaKey className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="Nueva contraseña" 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
              <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-200">
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <button onClick={() => { closeModals(); openLoginModal(); }} className="text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">
              Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
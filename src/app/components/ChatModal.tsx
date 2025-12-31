'use client';
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ChatRoom from './ChatRoom';
// Importamos el cliente Supabase
import { supabase } from '../lib/supabaseClient'; 

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number | null;
  currentUserId: string;
  currentUserRole: 'cliente' | 'montador';
  jobTitle?: string;
  myAvatar?: string;
  otherAvatar?: string;
  otherName?: string;
}

export default function ChatModal({ 
  isOpen, 
  onClose, 
  jobId, 
  currentUserId, 
  currentUserRole,
  jobTitle = "Chat del Trabajo",
  myAvatar,
  otherAvatar,
  otherName
}: ChatModalProps) {
  
  // LÓGICA AÑADIDA: Marca como leído al abrirse el modal
  useEffect(() => {
    if (isOpen && jobId && currentUserId) {
      const marcarComoLeido = async () => {
        // El ROL contrario es el que escribió el mensaje que debo marcar como leído
        const targetRole = currentUserRole === 'cliente' ? 'montador' : 'cliente';
        
        try {
          // 🛑 CRÍTICO: UPDATE de la columna is_read para el chat actual, solo si el mensaje es del bando contrario
          const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('job_id', jobId)
            .eq('sender_role', targetRole); 

          if (error) console.error("Error al marcar como leído:", error);
          
        } catch (e) {
          console.error("Fallo de conexión al marcar como leído:", e);
        }
      };
      marcarComoLeido();
    }
  }, [isOpen, jobId, currentUserId, currentUserRole]);


  if (!isOpen || !jobId) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Cabecera del Modal */}
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">{jobTitle}</h3>
            <p className="text-[10px] text-gray-400">ID: #{jobId}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="h-[500px]">
            <ChatRoom 
                jobId={jobId} 
                currentUserId={currentUserId} 
                currentUserRole={currentUserRole}
                myAvatar={myAvatar}
                otherAvatar={otherAvatar}
                otherName={otherName}
            />
        </div>

      </div>
    </div>
  );
}
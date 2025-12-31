'use client';
import { useState, useEffect, useRef } from 'react';
// Asegúrate de que esta ruta es correcta en tu proyecto
import { supabase } from '../lib/supabaseClient'; 
import { FaPaperPlane, FaTools, FaUser, FaCheckDouble } from 'react-icons/fa';

interface Message {
  id: number;
  content: string;
  sender_id: string;
  created_at: string;
  sender_role: 'cliente' | 'montador';
}

interface ChatRoomProps {
  jobId: number;       
  currentUserId: string; 
  currentUserRole: 'cliente' | 'montador';
  myAvatar?: string;
  otherAvatar?: string;
  otherName?: string;
}

export default function ChatRoom({ jobId, currentUserId, currentUserRole, myAvatar, otherAvatar, otherName }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) console.error('Error chat:', error);
      else setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat_job_${jobId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
        (payload: any) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const msgToSend = newMessage;
    setNewMessage(''); 

    const { error } = await supabase.from('messages').insert({
      job_id: jobId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      content: msgToSend,
    });

    if (error) {
      console.error('Error:', error);
      setNewMessage(msgToSend); 
    }
  };

  // Helper para renderizar el Avatar
  const renderAvatar = (isMontador: boolean, photoUrl?: string) => {
    if (photoUrl) {
      return (
        <img 
          src={photoUrl} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100"
        />
      );
    }
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm 
          ${isMontador ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
          {isMontador ? <FaTools size={14} /> : <FaUser size={14} />}
      </div>
    );
  };

  if (loading) return <div className="flex h-full items-center justify-center bg-white text-gray-500">Cargando...</div>;

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden font-sans">
      
      {/* HEADER LIMPIO */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm z-10">
        <div className="shrink-0">
            {renderAvatar(currentUserRole === 'cliente', otherAvatar)}
        </div>
        <div>
            <h3 className="font-bold text-gray-800 text-sm truncate max-w-[200px]">
                {otherName || (currentUserRole === 'cliente' ? 'Montador' : 'Cliente')}
            </h3>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-xs text-gray-500">En línea</p>
            </div>
        </div>
      </div>

      {/* ÁREA DE MENSAJES (Fondo Blanco Limpio) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm opacity-60">
            <p>No hay mensajes aún.</p>
          </div>
        )}

        {messages.map((msg) => {
          // CORRECCIÓN CRÍTICA: Comparamos ID y ROL para evitar conflictos de IDs repetidos
          const isMe = (String(msg.sender_id) === String(currentUserId)) && (msg.sender_role === currentUserRole);
          const isSenderMontador = msg.sender_role === 'montador';

          return (
            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
              
              <div className={`flex max-w-[85%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                
                {/* Avatar Pequeño (Solo para el OTRO) */}
                {!isMe && (
                    <div className="shrink-0 mb-1">
                        {renderAvatar(isSenderMontador, otherAvatar)}
                    </div>
                )}

                {/* BURBUJA */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm relative text-left
                    ${isMe 
                        ? 'bg-blue-600 text-white rounded-br-sm' // MÍO: Azul
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200' // OTRO: Gris
                    }`}
                >
                  {/* Etiqueta de Rol (Solo en mensajes recibidos) */}
                  {!isMe && (
                      <p className={`text-[10px] font-bold mb-1 ${isSenderMontador ? 'text-indigo-600' : 'text-orange-600'}`}>
                          {otherName || (isSenderMontador ? 'Montador' : 'Cliente')}
                      </p>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Hora */}
                  <div className={`flex justify-end items-center gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    <span>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <FaCheckDouble className="opacity-70" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shadow-md flex items-center justify-center"
        >
          <FaPaperPlane size={16} />
        </button>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 

export interface InboxSummary {
  jobId: number;
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
}

export const useInbox = (userId: string | undefined, userRole: string | undefined) => {
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [conversations, setConversations] = useState<InboxSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Función de recarga completa
  const fetchInboxData = async (currentUserId: string, currentUserRole: string) => {
    setLoading(true);
    const targetRole = currentUserRole === 'cliente' ? 'montador' : 'cliente';

    // 1. Contar mensajes NO LEÍDOS dirigidos a mí
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('sender_role', targetRole); 

    if (!error && count !== null) {
      setUnreadTotal(count);
    } else if (error) {
      console.error("Error al recontar buzón:", error);
    }

    // 2. Resumen de conversaciones
    const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (msgs) {
        const groups: Record<number, InboxSummary> = {};
        
        msgs.forEach((msg: any) => {
          if (!groups[msg.job_id]) {
            groups[msg.job_id] = {
              jobId: msg.job_id,
              lastMessage: msg.content,
              lastActivity: msg.created_at,
              unreadCount: 0
            };
          }
          if (!msg.is_read && msg.sender_role === targetRole) {
             groups[msg.job_id].unreadCount++;
          }
        });
        setConversations(Object.values(groups));
      }

    setLoading(false);
  };
  
  useEffect(() => {
    if (!userId || !userRole) return;

    // Ejecución inicial y al montar
    fetchInboxData(userId, userRole);

    // 3. Escuchar en tiempo real: INSERT (Nuevo mensaje) Y UPDATE (Marcar como leído)
    const channel = supabase
      .channel('inbox_global_listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' }, // Escucha INSERT y UPDATE
        (payload: any) => {
          const newMsg = payload.new || payload.old;
          const targetRole = userRole === 'cliente' ? 'montador' : 'cliente';
          
          if (newMsg.sender_role === targetRole) {
             // Si hay un INSERT o un UPDATE (marcado de is_read), recargamos los datos completos
             fetchInboxData(userId, userRole);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  return { unreadTotal, conversations, loading, refreshInbox: () => fetchInboxData(userId!, userRole!) };
};
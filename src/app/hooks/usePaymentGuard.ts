import { useState, useEffect } from 'react';

// 👇 ESTO ES CRÍTICO: La palabra 'export' permite que otros archivos usen este tipo
export interface PaymentMethod {
  id: string;
  label: string;
  icon?: any; 
  desc?: string;
}

// 👇 Aquí añadimos ': string' para que TypeScript deje de quejarse del "implicit any"
export const usePaymentGuard = (productId: string) => {
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [canChat, setCanChat] = useState(false);

  useEffect(() => {
    if (!productId) return;
    
    const savedPayment = localStorage.getItem(`payment_intent_${productId}`);
    if (savedPayment) {
      try {
        const parsed = JSON.parse(savedPayment);
        setSelectedPayment(parsed);
        setCanChat(true);
      } catch (e) {
        console.error("Error leyendo intención de pago guardada", e);
      }
    }
  }, [productId]);

  const initiateChat = () => {
    if (selectedPayment) {
      return true;
    } else {
      setPaymentModalOpen(true);
      return false;
    }
  };

  // 👇 Aquí añadimos ': PaymentMethod' para tipar el parámetro
  const confirmPaymentMethod = (method: PaymentMethod) => {
    setSelectedPayment(method);
    localStorage.setItem(`payment_intent_${productId}`, JSON.stringify(method));
    setPaymentModalOpen(false);
    setCanChat(true);
    return true;
  };

  const closeModal = () => setPaymentModalOpen(false);

  return {
    isPaymentModalOpen,
    closeModal,
    selectedPayment,
    canChat,
    initiateChat,
    confirmPaymentMethod
  };
};
'use client';
import { useState } from 'react';
import { 
    PaymentElement, 
    useStripe, 
    useElements 
} from '@stripe/react-stripe-js';

// --- Definimos las "props" que este componente recibirá ---
interface CheckoutFormProps {
    clientSecret: string; // <-- ¡ESTA LÍNEA SOLUCIONA EL ERROR!
    amount: number; 
    clientName: string; 
    onPaymentSuccess: (paymentIntentId: string) => void; 
    onCancel: () => void; 
}

// --- Textos (T) ---
const T = {
  paymentTitle: "Confirma tu solicitud",
  paymentSubtext: "Para proteger a nuestros montadores y verificar tu solicitud, autorizaremos este importe en tu tarjeta. No te cobraremos nada hasta que el trabajo esté completado.",
  paymentButton: "Autorizar {price}€",
};

// --- Añadimos clientSecret aquí también ---
export default function CheckoutForm({ clientSecret, amount, clientName, onPaymentSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Confirmamos el pago (la "Autorización")
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      // No queremos que nos redirija a otra página, manejamos el resultado aquí
      redirect: 'if_required' 
    });

    if (error) {
      setErrorMessage(error.message || 'Ocurrió un error inesperado.');
      setIsProcessing(false);
    } else if (paymentIntent && (paymentIntent.status === 'requires_capture')) {
      // --- ¡ÉXITO DE AUTORIZACIÓN! ---
      // El estado 'requires_capture' es el correcto para "Auth-and-Capture".
      onPaymentSuccess(paymentIntent.id);
      
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // (Este caso es raro con 'manual', pero por si acaso)
        onPaymentSuccess(paymentIntent.id);
    } else {
       setErrorMessage('El pago no se completó. Inténtalo de nuevo.');
       setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="p-6">
      <h3 className="text-xl font-bold text-primario-oscuro mb-2">
        ¡Último paso, {clientName}!
      </h3>
      <p className="text-sm text-gray-600 mb-4">{T.paymentSubtext}</p>
      
      {/* 2. Este es el formulario mágico de Stripe (Tarjeta, etc.) */}
      <PaymentElement id="payment-element" />
      
      {errorMessage && (
        <div id="payment-message" className="text-sm text-red-600 my-4">
          {errorMessage}
        </div>
      )}
      
      {/* 3. Botones de Acción */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row-reverse sm:justify-between sm:items-center gap-3">
        <button
            type="button" 
            disabled={isProcessing}
            onClick={onCancel} 
            className="w-full sm:w-auto px-6 py-2 font-bold text-gray-700 bg-gray-200 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50"
        >
            Volver
        </button>
        
        <button 
          disabled={isProcessing || !stripe || !elements} 
          id="submit"
          className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-primario-oscuro rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
        >
          <span id="button-text">
            {isProcessing ? "Procesando..." : T.paymentButton.replace('{price}', amount.toFixed(2))}
          </span>
        </button>
      </div>
    </form>
  );
}
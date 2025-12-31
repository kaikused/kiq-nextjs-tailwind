'use client';
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; // Tu formulario existente

// Cargamos Stripe con la clave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientSecret: string;
    amount: number;
    clientName: string; // Para personalizar el saludo
    onPaymentSuccess: (paymentIntentId: string) => void;
}

export default function PaymentModal({ 
    isOpen, onClose, clientSecret, amount, clientName, onPaymentSuccess 
}: PaymentModalProps) {
    
    if (!isOpen || !clientSecret) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden m-4">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-1">
                    {/* Envolvemos el formulario con Elements de Stripe */}
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <CheckoutForm 
                            clientSecret={clientSecret}
                            amount={amount}
                            clientName={clientName}
                            onPaymentSuccess={onPaymentSuccess}
                            onCancel={onClose}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
}
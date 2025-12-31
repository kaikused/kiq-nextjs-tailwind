'use client';
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- 1. Definimos las Interfaces de Datos y Funcionalidades ---

// Interfaz para los datos del usuario logueado
export interface UserProfile {
    id: number;
    nombre: string;
    email: string;
    tipo: 'cliente' | 'montador';
    foto_url: string | null;
    stripe_boarding_completado?: boolean;
    stripe_account_id?: string | null; 
    telefono?: string;
    zona_servicio?: string;
    bono_entregado?: boolean; 
    // 👇 CAMBIO QUIRÚRGICO: Añadida esta propiedad para evitar el error TS en el Panel Montador
    bono_visto?: boolean; 
}

interface UIContextType {
    // --- LÓGICA DE MODALES ---
    isLoginModalOpen: boolean;
    isRegisterModalOpen: boolean;
    isCalculatorModalOpen: boolean;
    calculatorMode: 'public' | 'lite';
    openLoginModal: () => void;
    openRegisterModal: () => void;
    openCalculatorModal: (mode?: 'public' | 'lite') => void;
    closeModals: () => void;

    // --- AUTENTICACIÓN Y PERFIL ---
    isLoggedIn: boolean; 
    accessToken: string | null; 
    userProfile: UserProfile | null; 
    
    handleSuccessfulLogin: (token: string, profileData: UserProfile, gems: number) => void;
    handleLogout: () => void;
    
    // Funciones de Reactividad
    updateProfilePhoto: (url: string) => void; 
    updateProfileData: (data: Partial<UserProfile>) => void; 

    // --- GEMAS Y TIENDA ---
    userGems: number; 
    updateUserGems: (n: number) => void; 
    isGemStoreOpen: boolean;
    openGemStore: () => void;
    closeGemStore: () => void;
}

// 2. Creamos el Contexto
const UIContext = createContext<UIContextType | undefined>(undefined);

// 3. Creamos el "Proveedor"
export function UIProvider({ children }: { children: ReactNode }) {
    // --- ESTADOS DE UI ---
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
    const [calculatorMode, setCalculatorMode] = useState<'public' | 'lite'>('public');

    // --- ESTADOS DE USUARIO ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // --- ESTADOS DE GEMAS Y TIENDA ---
    const [userGems, setUserGems] = useState(0); 
    const [isGemStoreOpen, setIsGemStoreOpen] = useState(false);

    // --- LÓGICA DE PERSISTENCIA (useEffect) ---
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken'); 
        if (storedToken) {
            setAccessToken(storedToken);
            setIsLoggedIn(true);
        }
    }, []); 

    // --- FUNCIONES DE AUTENTICACIÓN Y PERFIL ---

    const handleSuccessfulLogin = (token: string, profileData: UserProfile, gems: number) => {
        localStorage.setItem('accessToken', token); 
        
        setAccessToken(token);
        setUserProfile(profileData);
        setUserGems(gems);
        setIsLoggedIn(true);
        
        closeModals();
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('kiq_bono_visto'); // Limpieza extra para pruebas
        setAccessToken(null);
        setUserProfile(null);
        setUserGems(0);
        setIsLoggedIn(false);
    };
    
    const updateProfilePhoto = (url: string) => {
        if (userProfile) {
            setUserProfile(prev => prev ? { ...prev, foto_url: url } : null);
        }
    };

    const updateProfileData = (data: Partial<UserProfile>) => {
        if (userProfile) {
            setUserProfile(prev => prev ? { ...prev, ...data } : null);
        }
    };

    // --- FUNCIONES DE MODALES Y TIENDA ---

    const openLoginModal = () => {
        setIsRegisterModalOpen(false);
        setIsCalculatorModalOpen(false);
        setIsGemStoreOpen(false); 
        setIsLoginModalOpen(true);
    };

    const openRegisterModal = () => {
        setIsLoginModalOpen(false); 
        setIsCalculatorModalOpen(false);
        setIsGemStoreOpen(false); 
        setIsRegisterModalOpen(true);
    };

    const openCalculatorModal = (mode: 'public' | 'lite' = 'public') => {
        setCalculatorMode(mode);
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
        setIsGemStoreOpen(false); 
        setIsCalculatorModalOpen(true);
    };

    const closeModals = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
        setIsCalculatorModalOpen(false);
        setIsGemStoreOpen(false); 
        setTimeout(() => setCalculatorMode('public'), 300);
    };

    const updateUserGems = (n: number) => setUserGems(n);
    
    const openGemStore = () => {
        closeModals(); 
        setIsGemStoreOpen(true);
    };

    const closeGemStore = () => setIsGemStoreOpen(false);

    // --- RETURN DEL PROVIDER ---
    return (
        <UIContext.Provider value={{ 
            isLoginModalOpen, 
            isRegisterModalOpen, 
            isCalculatorModalOpen,
            calculatorMode, 
            openLoginModal, 
            openRegisterModal, 
            openCalculatorModal,
            closeModals, 
            
            isLoggedIn,
            accessToken,
            userProfile,
            handleSuccessfulLogin,
            handleLogout,
            updateProfilePhoto,
            updateProfileData,
            
            userGems,
            updateUserGems,
            isGemStoreOpen,
            openGemStore,
            closeGemStore
        }}>
            {children}
        </UIContext.Provider>
    );
}

// 4. Hook para usar el Contexto
export function useUI() {
    const context = useContext(UIContext); 
    if (context === undefined) {
        throw new Error('useUI debe ser usado dentro de un UIProvider');
    }
    return context;
}
'use client';
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // No es estrictamente necesario aquí

// --- 1. Definimos las Interfaces ---

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
    bono_visto?: boolean;
    gemas?: number; // Añadido para consistencia
}

interface UIContextType {
    // --- LÓGICA DE MODALES ---
    isLoginModalOpen: boolean;
    isRegisterModalOpen: boolean;
    isCalculatorModalOpen: boolean;
    isRecoveryModalOpen: boolean; 
    calculatorMode: 'public' | 'lite';
    
    openLoginModal: () => void;
    openRegisterModal: () => void;
    openCalculatorModal: (mode?: 'public' | 'lite') => void;
    openRecoveryModal: () => void;
    closeModals: () => void;

    // --- AUTENTICACIÓN Y PERFIL ---
    isLoggedIn: boolean; 
    accessToken: string | null; 
    userProfile: UserProfile | null; 
    
    handleSuccessfulLogin: (token: string, profileData: UserProfile, gems: number) => void;
    handleLogout: () => void;
    
    updateProfilePhoto: (url: string) => void; 
    updateProfileData: (data: Partial<UserProfile>) => void; 

    // --- GEMAS Y TIENDA ---
    userGems: number; 
    updateUserGems: (n: number) => void; 
    isGemStoreOpen: boolean;
    openGemStore: () => void;
    closeGemStore: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    // --- ESTADOS DE UI ---
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
    const [calculatorMode, setCalculatorMode] = useState<'public' | 'lite'>('public');

    // --- ESTADOS DE USUARIO ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // --- ESTADOS DE GEMAS Y TIENDA ---
    const [userGems, setUserGems] = useState(0); 
    const [isGemStoreOpen, setIsGemStoreOpen] = useState(false);

    // --- LÓGICA DE PERSISTENCIA ---
    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken'); 
        if (storedToken) {
            setAccessToken(storedToken);
            setIsLoggedIn(true);
            
            // Opcional: Podríamos hacer un fetch aquí para refrescar datos del usuario
            // fetchUserProfile(storedToken); 
        }
    }, []); 

    // --- FUNCIONES ---

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
        localStorage.removeItem('token'); // Limpieza extra por si acaso
        localStorage.removeItem('kiq_bono_visto'); 
        setAccessToken(null);
        setUserProfile(null);
        setUserGems(0);
        setIsLoggedIn(false);
        window.location.href = '/'; // Redirección forzada al home
    };
    
    // 🚀 MEJORA: Actualización directa del estado para reflejar cambios al instante
    const updateProfilePhoto = (url: string) => {
        if (userProfile) {
            setUserProfile({ ...userProfile, foto_url: url });
        }
    };

    const updateProfileData = (data: Partial<UserProfile>) => {
        if (userProfile) {
            setUserProfile({ ...userProfile, ...data });
        }
    };

    // --- MODALES ---

    const openLoginModal = () => {
        closeModals(); 
        setIsLoginModalOpen(true);
    };

    const openRegisterModal = () => {
        closeModals();
        setIsRegisterModalOpen(true);
    };

    const openCalculatorModal = (mode: 'public' | 'lite' = 'public') => {
        closeModals();
        setCalculatorMode(mode);
        setIsCalculatorModalOpen(true);
    };

    const openRecoveryModal = () => {
        closeModals();
        setIsRecoveryModalOpen(true);
    };

    const closeModals = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
        setIsCalculatorModalOpen(false);
        setIsRecoveryModalOpen(false);
        setIsGemStoreOpen(false); 
        setTimeout(() => setCalculatorMode('public'), 300);
    };

    const updateUserGems = (n: number) => setUserGems(n);
    
    const openGemStore = () => {
        closeModals(); 
        setIsGemStoreOpen(true);
    };

    const closeGemStore = () => setIsGemStoreOpen(false);

    return (
        <UIContext.Provider value={{ 
            isLoginModalOpen, 
            isRegisterModalOpen, 
            isCalculatorModalOpen,
            isRecoveryModalOpen, 
            calculatorMode, 
            openLoginModal, 
            openRegisterModal, 
            openCalculatorModal,
            openRecoveryModal,
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

export function useUI() {
    const context = useContext(UIContext); 
    if (context === undefined) {
        throw new Error('useUI debe ser usado dentro de un UIProvider');
    }
    return context;
}
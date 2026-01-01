'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUI } from '../context/UIContext';
import { FaUserCircle, FaSignOutAlt, FaCog, FaChevronDown, FaGem, FaPlusCircle, FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import GemStoreModal from './GemStoreModal'; 
import { useInbox } from '../hooks/useInbox';


const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function Cabecera() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    
    const { 
        openLoginModal, openRegisterModal, openCalculatorModal, 
        userGems, 
        isGemStoreOpen, openGemStore, closeGemStore,
        isLoggedIn, 
        accessToken, 
        userProfile, 
        handleLogout, 
        handleSuccessfulLogin 
    } = useUI();

    const { unreadTotal, conversations, refreshInbox } = useInbox(
        userProfile?.id ? String(userProfile.id) : undefined,
        userProfile?.tipo
    );

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inboxRef = useRef<HTMLDivElement>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (isLoggedIn && accessToken && !userProfile) {
            const fetchUserData = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/perfil`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        handleSuccessfulLogin(accessToken, data, data.gemas || 0);
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    handleLogout(); 
                } finally {
                    setIsInitialLoad(false);
                }
            };
            fetchUserData();
        } else if (!isLoggedIn) {
             setIsInitialLoad(false);
        }
    }, [accessToken]);

    // Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
            // Nota: En móvil el inbox es modal, así que el click outside puede ser distinto, 
            // pero mantenemos esto para desktop.
            if (isInboxOpen && inboxRef.current && !inboxRef.current.contains(event.target as Node)) {
                setIsInboxOpen(false);
                refreshInbox(); 
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isInboxOpen, refreshInbox]);

    const localHandleLogout = () => {
        handleLogout();
        router.push('/');
        setIsUserDropdownOpen(false);
    };

    const handleOpenLogin = () => { setIsMenuOpen(false); openLoginModal(); };
    const handleOpenRegister = () => { setIsMenuOpen(false); openRegisterModal(); };
    const handleOpenCalculator = () => { setIsMenuOpen(false); openCalculatorModal('public'); };

    const goToPanel = () => {
        setIsUserDropdownOpen(false);
        if (!userProfile) return;
        if (userProfile.tipo === 'cliente') router.push('/panel-cliente');
        else if (userProfile.tipo === 'montador') router.push('/panel-montador');
    };

    const goToConfig = () => {
        setIsUserDropdownOpen(false);
        if (!userProfile) return;
        if (userProfile.tipo === 'cliente') router.push('/panel-cliente/configuracion');
        else if (userProfile.tipo === 'montador') router.push('/panel-montador/configuracion');
    };

    const goToChat = (jobId: number) => {
        setIsInboxOpen(false);
        if (!userProfile) return;
        refreshInbox();
        const basePath = userProfile.tipo === 'cliente' ? '/panel-cliente' : '/panel-montador';
        router.push(`${basePath}?chat=${jobId}`);
    };

    // MODO LOGUEADO
    if (isLoggedIn && userProfile) {
        const inicial = userProfile.nombre ? userProfile.nombre.charAt(0).toUpperCase() : 'U';

        return (
            <>
                <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
                    
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={90} height={35} className="h-8 w-auto" />
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-5">
                        
                        {/* --- BUZÓN DE ENTRADA --- */}
                        <div className="" ref={inboxRef}>
                            <button 
                                onClick={() => setIsInboxOpen(!isInboxOpen)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition relative"
                            >
                                <FaEnvelope size={20} />
                                {unreadTotal > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                        {unreadTotal > 9 ? '+9' : unreadTotal}
                                    </span>
                                )}
                            </button>

                            {isInboxOpen && (
                                <>
                                    {/* 1. Fondo oscuro para móvil (Overlay) */}
                                    <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setIsInboxOpen(false)}></div>

                                    {/* 2. Contenedor del Buzón */}
                                    {/* En móvil: Fixed, centrado o full width. En Desktop: Absolute dropdown */}
                                    <div className="
                                        fixed top-20 left-4 right-4 bottom-auto z-[70] bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col
                                        md:absolute md:top-full md:right-0 md:left-auto md:w-80 md:h-auto md:max-h-[500px]
                                    ">
                                        {/* Cabecera del Buzón */}
                                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-800 text-sm">Mensajes</span>
                                                {unreadTotal > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{unreadTotal} nuevos</span>}
                                            </div>
                                            {/* Botón cerrar solo visible en móvil para mejor UX */}
                                            <button onClick={() => setIsInboxOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                                                <FaTimes />
                                            </button>
                                        </div>
                                        
                                        {/* Lista Scrollable */}
                                        <div className="overflow-y-auto max-h-[60vh] md:max-h-[400px]">
                                            {conversations.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                                                    <FaEnvelope size={24} className="opacity-20"/>
                                                    <p>No tienes mensajes recientes.</p>
                                                </div>
                                            ) : (
                                                conversations.map((conv) => (
                                                    <button 
                                                        key={conv.jobId} 
                                                        onClick={() => goToChat(conv.jobId)}
                                                        className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition flex gap-3 border-b border-gray-50 last:border-0 relative items-start"
                                                    >
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${conv.unreadCount > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                            <FaEnvelope size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-baseline mb-0.5">
                                                                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                    Trabajo #{conv.jobId}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 shrink-0">
                                                                    {new Date(conv.lastActivity).toLocaleDateString(undefined, {day: '2-digit', month: 'short'})}
                                                                </p>
                                                            </div>
                                                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                                {conv.lastMessage || '📎 Adjunto'}
                                                            </p>
                                                        </div>
                                                        {conv.unreadCount > 0 && (
                                                            <span className="absolute top-4 right-4 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* GEMAS */}
                        <button 
                            onClick={openGemStore} 
                            className="flex items-center gap-1.5 bg-indigo-50/80 backdrop-blur-sm text-indigo-900 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-100 transition group"
                        >
                            <FaGem className="text-indigo-500 text-sm group-hover:scale-110 transition-transform" />
                            <span className="font-black text-sm">{userGems}</span> 
                            <FaPlusCircle className="text-indigo-300 text-xs ml-1 hover:text-indigo-600" />
                        </button>

                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        {/* AVATAR */}
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-2 focus:outline-none group">
                                {userProfile.foto_url ? (
                                    <div className="h-9 w-9 rounded-full overflow-hidden shadow-md ring-2 ring-transparent group-hover:ring-indigo-300 transition-all">
                                        <img src={userProfile.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                                        {inicial}
                                    </div>
                                )}
                                <FaChevronDown size={10} className={`text-gray-400 hidden sm:block transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* MENÚ USUARIO */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 border border-gray-100 animate-in fade-in slide-in-from-top-2 origin-top-right z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm font-bold text-gray-900 truncate capitalize">{userProfile.nombre}</p>
                                        <p className="text-xs text-gray-500 truncate mb-2">{userProfile.email}</p>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                            {userProfile.tipo}
                                        </span>
                                    </div>
                                    <div className="py-1">
                                        <button onClick={goToPanel} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-3 transition-colors">
                                            <FaUserCircle className="text-gray-400" /> Mi Panel
                                        </button>
                                        <button onClick={goToConfig} className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-3 transition-colors">
                                            <FaCog className="text-gray-400" /> Configuración
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={localHandleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium flex items-center gap-3 transition-colors">
                                        <FaSignOutAlt /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </header>
                <GemStoreModal isOpen={isGemStoreOpen} onClose={closeGemStore} onBuyPack={() => {}} onWatchAd={() => {}} />
            </>
        );
    }

    // MODO PÚBLICO
    return (
        <>
            <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="z-50">
                        <Link href="/"><Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={100} height={40} className="h-9 w-auto hover:opacity-80 transition-opacity" /></Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <nav className="hidden md:flex">
                            <ul className="flex items-center space-x-4">
                                <li><button onClick={handleOpenLogin} className="text-sm font-bold text-gray-600 hover:text-indigo-600 px-4 py-2">Iniciar Sesión</button></li>
                                <li><button onClick={handleOpenRegister} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg">Hazte Kiqer</button></li>
                                <li><button onClick={handleOpenCalculator} className="rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-pink-600 shadow-lg">Calcular Presupuesto</button></li>
                            </ul>
                        </nav>
                        <div className="md:hidden cursor-pointer z-50 text-gray-700 p-2" onClick={() => setIsMenuOpen(true)}><FaBars size={24} /></div>
                    </div>
                </div>
            </nav>
            <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`absolute top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl p-6 transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" onClick={() => setIsMenuOpen(false)}><Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={90} height={35} className="h-8 w-auto"/></Link>
                        <button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => setIsMenuOpen(false)}><FaTimes size={24} /></button>
                    </div>
                    <ul className="flex flex-col space-y-2">
                        <li><button onClick={handleOpenLogin} className="block w-full text-left p-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">Iniciar Sesión</button></li>
                        <li><button onClick={handleOpenRegister} className="block w-full text-left p-3 text-base font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl">Hazte Kiqer</button></li>
                        <div className="h-px bg-gray-100 my-2"></div>
                        <li><button onClick={handleOpenCalculator} className="w-full text-center py-3.5 text-base font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-md">Calcular Presupuesto</button></li>
                    </ul>
                </div>
            </div>
        </>
    );
}
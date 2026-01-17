'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUI } from '../context/UIContext';
import { FaUserCircle, FaSignOutAlt, FaCog, FaChevronDown, FaGem, FaPlusCircle, FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import GemStoreModal from './GemStoreModal'; 
import { useInbox } from '../hooks/useInbox';

const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function Cabecera() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    
    // --- ESTADO SCROLL PARA EFECTO CAMALEÓN ---
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const { 
        openLoginModal, openRegisterModal, openCalculatorModal, 
        userGems, isGemStoreOpen, openGemStore, closeGemStore,
        isLoggedIn, accessToken, userProfile, handleLogout, handleSuccessfulLogin 
    } = useUI();

    const { unreadTotal, conversations, refreshInbox } = useInbox(
        userProfile?.id ? String(userProfile.id) : undefined,
        userProfile?.tipo
    );

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inboxRef = useRef<HTMLDivElement>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // --- DETECCIÓN DE SCROLL ---
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        // Check inicial por si recargamos página ya scrolleada
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- LÓGICA DE USUARIO (INTACTA) ---
    useEffect(() => {
        if (isLoggedIn && accessToken && !userProfile) {
            const fetchUserData = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/perfil`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                    if (res.ok) {
                        const data = await res.json();
                        handleSuccessfulLogin(accessToken, data, data.gemas || 0);
                    } else handleLogout();
                } catch (error) { handleLogout(); } 
                finally { setIsInitialLoad(false); }
            };
            fetchUserData();
        } else if (!isLoggedIn) setIsInitialLoad(false);
    }, [accessToken]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsUserDropdownOpen(false);
            if (isInboxOpen && inboxRef.current && !inboxRef.current.contains(event.target as Node)) { setIsInboxOpen(false); refreshInbox(); }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isInboxOpen, refreshInbox]);

    const localHandleLogout = () => { handleLogout(); router.push('/'); setIsUserDropdownOpen(false); };
    const handleOpenLogin = () => { setIsMenuOpen(false); openLoginModal(); };
    const handleOpenRegister = () => { setIsMenuOpen(false); openRegisterModal(); };
    const handleOpenCalculator = () => { setIsMenuOpen(false); openCalculatorModal('public'); };

    const goToPanel = () => {
        setIsUserDropdownOpen(false);
        if (!userProfile) return;
        router.push(userProfile.tipo === 'cliente' ? '/panel-cliente' : '/panel-montador');
    };

    const goToConfig = () => {
        setIsUserDropdownOpen(false);
        if (!userProfile) return;
        router.push(userProfile.tipo === 'cliente' ? '/panel-cliente/configuracion' : '/panel-montador/configuracion');
    };

    const goToChat = (jobId: number) => {
        setIsInboxOpen(false);
        if (!userProfile) return;
        refreshInbox();
        router.push(userProfile.tipo === 'cliente' ? `/panel-cliente?chat=${jobId}` : `/panel-montador?chat=${jobId}`);
    };

    // --- ESTILOS DINÁMICOS ---
    const isHome = pathname === '/';
    // Es transparente SOLO si estamos en Home, arriba del todo, y el menú móvil está cerrado
    const isTransparent = isHome && !isScrolled && !isMenuOpen;

    const navClass = isTransparent 
        ? 'bg-transparent border-transparent py-4' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm';

    // Textos: Blanco en transparente, Gris oscuro en sólido
    const textColor = isTransparent ? 'text-white hover:text-white/80' : 'text-slate-700 hover:text-indigo-600';
    
    // Logo: Blanco puro en transparente, Normal en sólido
    const logoClass = isTransparent ? 'brightness-0 invert' : ''; 
    
    // Botones fantasma (Iniciar Sesión): Blanco/Transparente vs Gris/Blanco
    const buttonGhostClass = isTransparent 
        ? 'text-white hover:bg-white/10' 
        : 'text-slate-700 hover:bg-gray-50';

    // Botón de acción (Hazte Kiqer): Blanco con texto índigo vs Índigo con texto blanco
    const buttonActionClass = isTransparent
        ? 'bg-white text-indigo-900 hover:bg-gray-100'
        : 'bg-indigo-600 text-white hover:bg-indigo-700';

    // Botón Pedir Precio: Translúcido vs Oscuro
    const buttonPriceClass = isTransparent
        ? 'bg-white/20 text-white backdrop-blur-md border border-white/30 hover:bg-white/30'
        : 'bg-slate-900 text-white hover:bg-slate-800';


    // --------------------------------------------------------------------------------
    // RENDERIZADO
    // --------------------------------------------------------------------------------

    // 1. MODO LOGUEADO (Siempre barra blanca para consistencia en paneles)
    if (isLoggedIn && userProfile) {
        const inicial = userProfile.nombre ? userProfile.nombre.charAt(0).toUpperCase() : 'U';
        return (
            <>
                <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
                        <Link href="/" aria-label="Ir al inicio" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={90} height={35} className="h-8 w-auto" priority />
                        </Link>

                        <div className="flex items-center gap-3 sm:gap-5">
                            {/* BUZÓN */}
                            <div className="" ref={inboxRef}>
                                <button 
                                    onClick={() => setIsInboxOpen(!isInboxOpen)}
                                    aria-label={`Buzón, ${unreadTotal} mensajes`}
                                    className="p-2 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition relative"
                                >
                                    <FaEnvelope size={20} />
                                    {unreadTotal > 0 && (
                                        <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">{unreadTotal > 9 ? '+9' : unreadTotal}</span>
                                    )}
                                </button>
                                {/* Desplegable Buzón (Intacto) */}
                                {isInboxOpen && (
                                    <>
                                        <div className="fixed inset-0 bg-black/20 z-[60] md:hidden" onClick={() => setIsInboxOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                                <span className="font-bold text-gray-800 text-sm">Mensajes</span>
                                                {unreadTotal > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{unreadTotal} nuevos</span>}
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {conversations.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center"><FaEnvelope size={24} className="opacity-20 mb-2"/><p>Sin mensajes</p></div>
                                                ) : conversations.map((conv) => (
                                                    <button key={conv.jobId} onClick={() => goToChat(conv.jobId)} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 flex gap-3 items-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${conv.unreadCount > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}><FaEnvelope size={12}/></div>
                                                        <div className="min-w-0 flex-1"><p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>Trabajo #{conv.jobId}</p><p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Adjunto'}</p></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* GEMAS */}
                            <button onClick={openGemStore} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-100 transition group">
                                <FaGem className="text-sm group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-sm">{userGems}</span> 
                                <FaPlusCircle className="text-indigo-400 text-xs ml-1" />
                            </button>

                            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                            {/* AVATAR & MENU */}
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center gap-2 focus:outline-none group">
                                    {userProfile.foto_url ? (
                                        <div className="h-9 w-9 rounded-full overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-indigo-200 transition-all"><img src={userProfile.foto_url} alt="" className="w-full h-full object-cover" /></div>
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">{inicial}</div>
                                    )}
                                    <FaChevronDown size={10} className={`text-gray-400 hidden sm:block transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <p className="text-sm font-bold text-gray-900 truncate capitalize">{userProfile.nombre}</p>
                                            <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                                        </div>
                                        <button onClick={goToPanel} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-2"><FaUserCircle/> Mi Panel</button>
                                        <button onClick={goToConfig} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-2"><FaCog/> Configuración</button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button onClick={localHandleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"><FaSignOutAlt/> Cerrar Sesión</button>
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

    // 2. MODO PÚBLICO (Aquí aplicamos el diseño Camaleón)
    return (
        <>
            <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${navClass}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    {/* LOGO */}
                    <Link href="/" aria-label="Ir al inicio" className="group">
                        <div className={`transition-all duration-300 ${logoClass}`}>
                             <Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={100} height={40} className="h-8 w-auto" priority />
                        </div>
                    </Link>

                    {/* MENU DESKTOP */}
                    <div className="hidden md:flex items-center space-x-2">
                        <button onClick={handleOpenLogin} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${buttonGhostClass}`}>
                            Iniciar Sesión
                        </button>
                        <button onClick={handleOpenRegister} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-md ${buttonActionClass}`}>
                            Hazte Kiqer
                        </button>
                        <button onClick={handleOpenCalculator} className={`ml-2 px-5 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-md ${buttonPriceClass}`}>
                            Pedir Precio
                        </button>
                    </div>

                    {/* HAMBURGUESA MÓVIL */}
                    <button 
                        className={`md:hidden p-2 rounded-lg transition-colors ${isTransparent ? 'text-white' : 'text-slate-800'}`}
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Menú"
                    >
                        <FaBars size={24} />
                    </button>
                </div>
            </nav>

            {/* MENÚ MÓVIL (Off-canvas) */}
            <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-6 transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    <div className="flex items-center justify-between mb-8">
                        <Image src="/images/logo-kiq.svg" alt="Logo KIQ" width={90} height={35} className="h-7 w-auto"/>
                        <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><FaTimes size={24}/></button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <button onClick={handleOpenLogin} className="w-full text-left p-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center justify-between group">
                            Iniciar Sesión <FaChevronDown className="-rotate-90 text-gray-300 group-hover:text-indigo-500"/>
                        </button>
                        <button onClick={handleOpenRegister} className="w-full text-left p-4 text-lg font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100">
                            Hazte Kiqer
                        </button>
                    </div>

                    <div className="mt-auto">
                        <button onClick={handleOpenCalculator} className="w-full py-4 text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg transition-transform active:scale-95">
                            Pedir Precio Ahora
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
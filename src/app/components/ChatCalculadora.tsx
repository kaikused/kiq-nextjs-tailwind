'use client';
import { useState, useEffect, useRef } from 'react';
import { FaPaperclip, FaPaperPlane, FaRobot, FaImage } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import RegisterInChatModal from './RegisterInChatModal';

// --- Definiciones ---
type Message = {
    type: 'bot' | 'user' | 'loading' | 'summary' | 'ia-analysis';
    text: string;
    html?: string;
    imageUrl?: string;
    labels?: string[];
};

type Option = {
    text: string;
    value: string;
    href?: string;
    isExternal?: boolean;
};

type BudgetDetail = {
    label: string;
    value: string;
};

interface ItemDesglose {
    item: string;
    cantidad: number;
    precio_unitario: number; 
    subtotal: number;       
    necesita_anclaje: boolean;
}

interface AclaracionRequerida {
    ACLARACION_REQUERIDA: boolean;
    MUEBLE_PROBABLE: string;
    CAMPOS_FALTANTES?: string[];
}

interface DesgloseCompleto {
    coste_muebles_base: number;
    coste_desplazamiento: number;
    distancia_km: string;
    coste_anclaje_estimado: number;
    total_extras: number;
    muebles_cotizados: ItemDesglose[];
}

export interface Analysis {
    necesita_anclaje_general?: boolean;
    [key: string]: any;
}

interface ChatCalculadoraProps {
    onPublishSuccess?: () => void;
    mode?: 'public' | 'lite';
    initialPrompt?: string; 
    initialUserName?: string; 
}

const T = {
    inputPlaceholderName: "Escribe tu nombre...",
    welcomeName: "¡Hola! Soy el asistente virtual de KIQ. Para empezar, ¿cómo te llamas?",
    welcomeUser: "¡Genial, {name}! Ahora cuéntame qué necesitas montar. Puedes describirlo o subir una foto.",
    inputPlaceholderDescription: "Ej: Montar un armario PAX de 2 puertas y una cómoda",
    welcomeBack: "¡Hola de nuevo, {name}! Cuéntame qué necesitas montar para tu nuevo trabajo.",

    confirmPublish: "Perfecto. Tu precio estimado es de {priceText}. ¿Guardamos este presupuesto en tu panel para que puedas revisarlo?",
    publishingLite: "Guardando tu cotización...",
    publishSuccessLite: "¡Cotización guardada! Vamos a tu panel.",

    askForPhoto: "¿Quieres añadir una foto para que el presupuesto sea más preciso?",
    yesAddPhoto: "Sí, añadir foto",
    noContinue: "No, continuar solo con texto",

    askForDescriptionAfterPhoto: "¡Foto/s recibida/s! Ahora, añade una breve descripción (o pulsa enviar).",
    processingImage: "Analizando la/s imagen/es, un momento...",
    processingDescription: "Analizando tu descripción...",
    imageError: "Lo siento, ha habido un problema al procesar la imagen. Inténtalo de nuevo.",
    finalQuestion: "Entendido. Una última pregunta: ¿el mueble (o alguno de ellos) necesita anclarse a la pared?",
    si: "Sí",
    no: "No",
    askAddressMessage: "Perfecto. Por último, para calcular el desplazamiento, ¿podrías indicarme tu código postal o la zona/barrio de Málaga?",
    inputPlaceholderAddress: "Ej: 29010 o Teatinos",
    inputPlaceholderQuantity: "Ej: 3", 
    processingAddress: "Calculando la ruta...",
    summaryLabels: {
        anchoring: "Anclaje a pared",
        clientName: "Cliente",
        address: "Dirección"
    },

    askEmail: "¡Genial, {name}! Tu precio estimado es de {priceText}. Para guardar tu presupuesto y crear tu cuenta gratuita, ¿cuál es tu email?",
    askPassword: "Entendido. Ahora, crea una contraseña segura para tu cuenta.",
    inputPlaceholderEmail: "Escribe tu email...",
    inputPlaceholderPassword: "Crea una contraseña...",
    inputPlaceholderCode: "Código de 6 dígitos...",
    publishing: "Creando tu cuenta y guardando cotización...",
    publishSuccess: "¡Cuenta creada! Te redirigimos a tu panel...",
    publishError: "Hubo un error: {error}. Por favor, inténtalo de nuevo.",

    checkingEmail: "Comprobando tu email...",
    emailExists: "¡Hola de nuevo, {name}! Vemos que ya tienes una cuenta. Por favor, introduce tu contraseña para guardar este presupuesto en tu perfil.",
    emailTaken: "Ese email ya está registrado. Si eres tú, puedes iniciar sesión.",
    emailInvalid: "Por favor, introduce un formato de email válido.",
    inputPlaceholderLogin: "Introduce tu contraseña...",
    loginSuccess: "¡Contraseña correcta! Guardando cotización...",
    restartButton: "Calcular otro presupuesto",

    preRegister: "¡Genial, {name}! Tu precio estimado es de {priceText}. Haz clic en 'Aceptar' para guardar tu presupuesto y que un montador te contacte."
};


const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

function isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función auxiliar para obtener el token correcto
const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

const TypingIndicator = () => (
    <div className="flex space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
);

export default function ChatCalculadora({ onPublishSuccess, mode = 'public', initialPrompt = '', initialUserName }: ChatCalculadoraProps) {
    const [stage, setStage] = useState('start');
    const [clientName, setClientName] = useState('');
    const [currentTextDescription, setCurrentTextDescription] = useState('');
    const [currentImageFiles, setCurrentImageFiles] = useState<FileList | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [budgetDetails, setBudgetDetails] = useState<BudgetDetail[]>([]);
    const [storedAnalysis, setStoredAnalysis] = useState<Analysis | null>(null);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[] | null>(null);
    const [imageLabels, setImageLabels] = useState<string[] | null>(null);
    
    const [fullBreakdown, setFullBreakdown] = useState<DesgloseCompleto | null>(null); 
    const [needsClarity, setNeedsClarity] = useState<AclaracionRequerida | null>(null);
    
    const [isTyping, setIsTyping] = useState(false); 
    
    const [finalAddress, setFinalAddress] = useState('');
    const [finalPrice, setFinalPrice] = useState(0);
    const [userEmail, setUserEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(''); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    
    const hasInitialized = useRef(false); 

    const scrollToBottom = () => {
        messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, options, isTyping]); 

    const addBotMessage = (text: string, delay = 1000) => {
        setIsTyping(true); 
        
        setTimeout(() => {
            setIsTyping(false); 
            setMessages(prev => [...prev.filter(m => m.type !== 'loading'), { type: 'bot', text: text }]);
            
            if (inputRef.current && stage !== 'done') {
                if (options.length === 0) inputRef.current.focus();
            }
        }, delay);
    };

    // --- LÓGICA DE INICIALIZACIÓN ---
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initializeChat = async () => {
            // CASO A: Venimos del Panel (Modo Lite) y tenemos Nombre (Usuario Logueado)
            if (mode === 'lite' && initialUserName) {
                setIsAuthenticated(true);
                startChat(initialUserName, initialPrompt);
                return;
            }

            // CASO B: Modo Lite pero sin nombre (Reload de página)
            if (mode === 'lite') {
                const token = getToken(); // USAMOS LA FUNCIÓN SEGURA
                if (!token) {
                    startChat(null, initialPrompt);
                    return;
                }
                try {
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const res = await fetch(`${API_BASE_URL}/api/perfil`, { headers });
                    const data = await res.json();
                    if (res.ok && data.tipo === 'cliente') {
                        setIsAuthenticated(true);
                        startChat(data.nombre, initialPrompt);
                    } else {
                        // Token inválido, limpiamos
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('token');
                        startChat(null, initialPrompt);
                    }
                } catch (error) {
                    startChat(null, initialPrompt);
                }
                return;
            }

            // CASO C: Modo Público (Home)
            setIsAuthenticated(false);
            startChat(null, initialPrompt);
        };

        initializeChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, initialUserName]);

    const startChat = (nombreUsuario: string | null, promptInicial: string = '') => {
        setClientName(nombreUsuario || ''); 
        
        // --- DETECCIÓN DE SALUDO INICIAL (Frontend) ---
        const saludos = ['hola', 'buenos', 'buenas', 'hey', 'que tal'];
        const esSaludo = promptInicial && saludos.some(s => promptInicial.toLowerCase().startsWith(s)) && promptInicial.length < 15;

        // Si es un saludo, NO lo guardamos como descripción para no romper el flujo
        if (promptInicial && !esSaludo) {
            setCurrentTextDescription(promptInicial);
        } else {
            setCurrentTextDescription('');
        }
        
        setCurrentImageFiles(null);
        setInputValue('');
        setMessages([]);
        setOptions([]);
        setBudgetDetails([]);
        setStoredAnalysis(null);
        setUploadedImageUrls(null);
        setImageLabels(null);
        setIsTyping(false);
        setFullBreakdown(null);
        setNeedsClarity(null);
        setFinalAddress('');
        setFinalPrice(0);
        setUserEmail('');
        setVerificationCode('');
        setError('');

        if (nombreUsuario && mode === 'lite') {
            setIsAuthenticated(true);
            addBotMessage(T.welcomeBack.replace('{name}', nombreUsuario), 800);
            setStage('describe');
        } else {
            setIsAuthenticated(false);
            if (promptInicial && !esSaludo) {
                addBotMessage(`¡Hola! Veo que quieres cotizar: "${promptInicial}". Para darte el precio exacto, primero dime: ¿cómo te llamas?`, 600);
                setStage('ask_name'); 
            } else {
                // Si no hay prompt o es solo un saludo, empezamos normal
                addBotMessage(T.welcomeName, 800);
                setStage('ask_name');
            }
        }
    }

    const showOptions = (newOptions: Option[]) => {
        setTimeout(() => setOptions(newOptions), 1200);
    };

    const addUserMessage = (text: string) => {
        const newUserMessage: Message = { type: 'user', text: text };
        setMessages(prev => [...prev, newUserMessage]);
        return newUserMessage;
    };

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text && stage !== 'awaiting_description_after_photo') return;

        addUserMessage(text);
        setInputValue('');

        if (stage === 'ask_name') {
            setClientName(text);

            if (currentTextDescription) {
                addBotMessage(`¡Encantado, ${text}! He tomado nota de que necesitas: "${currentTextDescription}".`);
                setTimeout(() => {
                    addBotMessage(T.askForPhoto);
                    showOptions([
                        { text: T.yesAddPhoto, value: 'yes_photo' },
                        { text: T.noContinue, value: 'no_photo' }
                    ]);
                    setStage('awaiting_photo_option'); 
                }, 800);
            } else {
                // Si veníamos de un saludo, ahora pedimos la descripción
                addBotMessage(`¡Encantado, ${text}! ¿Qué necesitas montar hoy? (Ej: Un armario, una mesa...)`);
                setStage('describe');
            }

        } else if (stage === 'describe') {
            setCurrentTextDescription(text);
            addBotMessage(T.askForPhoto);
            showOptions([
                { text: T.yesAddPhoto, value: 'yes_photo' },
                { text: T.noContinue, value: 'no_photo' }
            ]);
            setStage('awaiting_photo_option');
        } else if (stage === 'awaiting_description_after_photo') {
            setCurrentTextDescription(text);
            const analysisData = await sendDataToBackend(text, currentImageFiles);
            
            if (analysisData) { 
                await processInitialAnalysis(analysisData);
            } else if (!needsClarity) {
                addBotMessage("Lo siento, hubo un error de análisis. Reiniciemos.");
                setStage('describe');
            }

        } else if (stage === 'awaiting_clarification_quantity' && needsClarity) {
            
            // MANEJO DE ENTRADA MANUAL DE TEXTO (Si ignoran los botones)
            let newDescription = "";
            
            // Caso especial: Armario pidiendo TIPO de puerta
            if (needsClarity.CAMPOS_FALTANTES && needsClarity.CAMPOS_FALTANTES.includes('tipo_puerta')) {
                // Asumimos que lo que escriben es el tipo
                newDescription = `armario de puertas ${text}`;
            } else {
                // Asumimos que es cantidad numérica
                const quantity = parseInt(text.replace(/\D/g, ''), 10);
                
                if (isNaN(quantity) || quantity <= 0) {
                    addBotMessage("Por favor, introduce un número válido mayor a cero.");
                    return;
                }
                
                if (needsClarity.MUEBLE_PROBABLE === 'armario') {
                    // Si ya sabíamos el tipo, esto son puertas.
                    // IMPORTANTE: Concatenamos a la descripción anterior para no perder el "puertas correderas"
                    newDescription = `${currentTextDescription} de ${quantity} puertas`;
                } else {
                    const muebleName = needsClarity.MUEBLE_PROBABLE.replace(/_/g, ' ');
                    newDescription = `${quantity} ${muebleName}`;
                }
            }
            
            setNeedsClarity(null);
            setCurrentTextDescription(newDescription); 
            
            const analysisData = await sendDataToBackend(newDescription, currentImageFiles); 
            await processInitialAnalysis(analysisData);

        } else if (stage === 'ask_address') {
            await sendQuoteToBackend(text);
        
        } else if (stage === 'ask_email') {
            const email = text;
            if (!isValidEmail(email)) {
                addBotMessage(T.emailInvalid);
                setInputValue('');
                setStage('ask_email');
                return;
            }
            setIsTyping(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/check-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });
                setIsTyping(false);
                const result = await response.json();
                if (result.status === 'existente') {
                    addBotMessage(T.emailTaken);
                    setInputValue('');
                    setStage('ask_email');
                } else {
                    setUserEmail(email);
                    addBotMessage(T.askPassword);
                    setStage('ask_password');
                }
            } catch (error: any) {
                setIsTyping(false);
                addBotMessage(`Hubo un error: ${error.message}.`);
                setStage('ask_email');
            }

        } else if (stage === 'ask_password') {
            await handleRegister(text);

        } else if (stage === 'ask_login_password') {
            await handleLoginAndPublish(text);
        }
    };

    const handleRegister = async (password: string) => {
        setStage('done');
        setIsTyping(true); 
        try {
            const response = await fetch(`${API_BASE_URL}/api/publicar-y-registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: clientName, email: userEmail, password: password,
                    descripcion: currentTextDescription, direccion: finalAddress, precio_calculado: finalPrice,
                    imagenes: uploadedImageUrls, etiquetas: imageLabels, 
                    desglose: fullBreakdown 
                })
            });
            setIsTyping(false);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Error al registrar");

            localStorage.setItem('accessToken', result.access_token);
            addBotMessage(T.publishSuccess);

            setTimeout(() => {
                if (onPublishSuccess) onPublishSuccess();
                window.location.href = '/panel-cliente';
            }, 2000);

        } catch (error: any) {
            setIsTyping(false);
            addBotMessage(T.publishError.replace('{error}', error.message));
            setStage('ask_password');
        }
    };

    const handleLoginAndPublish = async (password: string) => {
        setStage('done');
        setIsTyping(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/login-y-publicar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail, password: password,
                    descripcion: currentTextDescription, direccion: finalAddress, precio_calculado: finalPrice,
                    imagenes: uploadedImageUrls, etiquetas: imageLabels,
                    desglose: fullBreakdown
                })
            });
            setIsTyping(false);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Error al iniciar sesión");

            localStorage.setItem('accessToken', result.access_token);
            addBotMessage(T.publishSuccessLite);

            setTimeout(() => {
                if (onPublishSuccess) onPublishSuccess();
                window.location.href = '/panel-cliente';
            }, 2000);

        } catch (error: any) {
            setIsTyping(false);
            addBotMessage(T.publishError.replace('{error}', error.message));
            setStage('ask_login_password');
        }
    };

    // --- CORRECCIÓN CLAVE AQUÍ ---
    const handlePublishLite = async () => {
        setIsTyping(true);

        // Usamos la función helper que busca ambos tokens
        const token = getToken();
        
        if (!token) {
            setIsTyping(false);
            // Mensaje más amigable y quizás redirigir al login si falla gravemente
            addBotMessage("Error: No se encontró tu sesión. Por favor, recarga la página.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/cliente/publicar-trabajo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Ahora sí lleva el token correcto
                },
                body: JSON.stringify({
                    descripcion: currentTextDescription,
                    direccion: finalAddress,
                    precio_calculado: finalPrice,
                    imagenes: uploadedImageUrls, etiquetas: imageLabels,
                    desglose: fullBreakdown
                })
            });

            setIsTyping(false);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al guardar cotización');

            addBotMessage(T.publishSuccessLite);

            setTimeout(() => {
                if (onPublishSuccess) {
                    onPublishSuccess();
                    window.location.reload();
                } else {
                    window.location.href = '/panel-cliente';
                }
            }, 2000);
            setStage('done');

        } catch (err: any) {
            setIsTyping(false);
            addBotMessage(T.publishError.replace('{error}', err.message));
            setStage('ask_address');
        }
    };

    const handleOptionClick = async (option: Option) => {
        if (option.value === 'nav_panel_cliente') {
            router.push('/panel-cliente');
            if (onPublishSuccess) onPublishSuccess();
            return;
        }
        if (option.href) {
            window.open(option.href, '_blank');
            return;
        }

        // --- LÓGICA DE BOTONES DE ACLARACIÓN (ARMARIOS Y POPUP) ---
        
        // A) TIPO DE PUERTA
        if (option.value.startsWith('clarify_type_')) {
            const tipo = option.value.split('_')[2]; // 'correderas' o 'batientes'
            const newDescription = `armario de puertas ${tipo}`; 
            
            addUserMessage(option.text);
            setOptions([]); setNeedsClarity(null); setCurrentTextDescription(newDescription);
            
            const analysisData = await sendDataToBackend(newDescription, currentImageFiles); 
            await processInitialAnalysis(analysisData);
            return;
        }

        // B) CANTIDAD DE PUERTAS
        if (option.value.startsWith('clarify_doors_')) {
            if (option.value === 'clarify_doors_more') {
                addUserMessage(option.text); setOptions([]);
                addBotMessage("Entendido. Por favor, escribe el número exacto de puertas:");
                return; 
            }
            const numPuertas = option.value.split('_')[2];
            // TRUCO: Concatenamos a la descripción actual para no perder el "puertas correderas"
            const newDescription = `${currentTextDescription} de ${numPuertas} puertas`; 
            
            addUserMessage(option.text);
            setOptions([]); setNeedsClarity(null); setCurrentTextDescription(newDescription);
            
            const analysisData = await sendDataToBackend(newDescription, currentImageFiles); 
            await processInitialAnalysis(analysisData);
            return;
        }
        
        // C) BOTÓN DE ACEPTAR PRECIO (ABRIR REGISTRO)
        if (option.value === 'open_register_modal') {
            setIsRegisterModalOpen(true);
            return;
        }
        // ---------------------------------------------------------

        addUserMessage(option.text);
        setOptions([]);
        
        if (stage === 'awaiting_photo_option') {
            if (option.value === 'yes_photo') {
                fileInputRef.current?.click();
            } else {
                const analysisData = await sendDataToBackend(currentTextDescription, null); 
                
                if (analysisData) { 
                    await processInitialAnalysis(analysisData);
                } 
            }
        } else if (stage === 'ask_anchoring') {
            setBudgetDetails(prev => [...prev, { label: T.summaryLabels.anchoring, value: option.text }]);
            await askForAddress();
        } else if (option.value === 'si' || option.value === 'no') {
            if (stage === 'ask_anchoring') {
                 await askForAddress();
            }
        } else if (option.value === 'restart') {
            if (typeof window !== 'undefined') {
                window.location.reload();
            }

        } else if (stage === 'confirm_publish_loggedin') {
            if (option.value === 'confirm_yes') {
                await handlePublishLite();
            } else {
                startChat(clientName);
            }
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const files = event.target.files;
        setCurrentImageFiles(files);
        const fileNames = Array.from(files).map(f => f.name);
        addUserMessage(`🖼️ Archivo/s subido/s: ${fileNames.join(', ')}`);
        setOptions([]);
        
        if (currentTextDescription) {
            const analysisData = await sendDataToBackend(currentTextDescription, files);
            
            if (analysisData) {
                await processInitialAnalysis(analysisData);
            } 
            
        } else {
            addBotMessage(T.askForDescriptionAfterPhoto);
            setStage('awaiting_description_after_photo');
        }
    };

    async function sendDataToBackend(text: string, files: FileList | null): Promise<any | null> {
        const formData = new FormData();
        formData.append('descripcion_texto_mueble', text);
        formData.append('language', 'es');
        formData.append('client_name', clientName);
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                formData.append('imagen', files[i]);
            }
        }
        
        setIsTyping(true); 
        
        try {
            const response = await fetch(`${API_BASE_URL}/calcular_presupuesto`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.status === 422 && data.ACLARACION_REQUERIDA) {
                setIsTyping(false);
                setNeedsClarity(data as AclaracionRequerida); 
                // Pasamos los campos faltantes a la función
                await askForQuantityClarity(data.MUEBLE_PROBABLE, data.CAMPOS_FALTANTES); 
                return null; 
            }

            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            
            setIsTyping(false);
            return data;
        } catch (error) {
            console.error("Error en sendDataToBackend:", error);
            setIsTyping(false);
            addBotMessage("Hubo un error de conexión o análisis. Inténtalo de nuevo.");
            setStage('describe');
            return null;
        }
    }
    
    // --- FUNCIÓN DE CLARIFICACIÓN MEJORADA (2 PASOS) ---
    async function askForQuantityClarity(muebleKey: string, camposFaltantes: string[] = []) {
        // 1. SALUDO
        if (muebleKey === 'saludo') {
            addBotMessage("¡Hola! 👋 Soy tu asistente de montajes. Cuéntame, ¿qué muebles necesitas montar hoy? (Ej: 'Un armario PAX', 'Una cómoda')");
            setStage('describe'); 
            setCurrentTextDescription(''); 
            return;
        }
        // 2. DESCONOCIDO
        if (muebleKey === 'desconocido') {
            addBotMessage("Lo siento, no he entendido qué mueble es ese. ¿Podrías intentar describirlo de otra forma?");
            setStage('describe');
            setCurrentTextDescription('');
            return;
        }

        // 3. ARMARIO (PASOS SECUENCIALES)
        if (muebleKey === 'armario') {
            // Paso 1: Tipo de puerta (Si falta)
            if (camposFaltantes && camposFaltantes.includes('tipo_puerta')) {
                addBotMessage("Entendido, es un armario. Para darte el precio exacto, ¿cómo son las puertas?");
                setStage('awaiting_clarification_quantity');
                showOptions([
                    { text: "Batientes (Abatibles)", value: "clarify_type_batientes" },
                    { text: "Correderas", value: "clarify_type_correderas" }
                ]);
                return;
            }
            // Paso 2: Cantidad de puertas (Si falta)
            if (camposFaltantes && camposFaltantes.includes('num_puertas')) {
                addBotMessage("Perfecto. ¿Cuántas puertas/cuerpos tiene el armario?");
                setStage('awaiting_clarification_quantity');
                showOptions([
                    { text: "1 Puerta", value: "clarify_doors_1" },
                    { text: "2 Puertas", value: "clarify_doors_2" },
                    { text: "3 Puertas", value: "clarify_doors_3" },
                    { text: "4 Puertas", value: "clarify_doors_4" },
                    { text: "Más de 4", value: "clarify_doors_more" }
                ]);
                return;
            }
        }

        // 4. OTROS MUEBLES
        const muebleName = muebleKey.replace(/_/g, ' '); 
        const clarificationMessage = `¡Ups! Para darte el precio exacto, necesito una cantidad específica de ${muebleName}. Por favor, indica SÓLO la cantidad de unidades que deseas montar (Ej: '2').`;

        setStage('awaiting_clarification_quantity');
        addBotMessage(clarificationMessage);
    }

    async function processInitialAnalysis(analysisData: { analisis: Analysis; image_urls: string[] | null; image_labels: string[] | null } | null) {
        if (!analysisData || !analysisData.analisis) {
            console.error("Error: Análisis inicial no válido (falta clave 'analisis').", analysisData);
            if (!needsClarity) { 
                addBotMessage("Lo siento, hubo un error de análisis. Reiniciemos.");
                setStage('describe');
            }
            return;
        }
        setStoredAnalysis(analysisData.analisis);
        setUploadedImageUrls(analysisData.image_urls);
        setImageLabels(analysisData.image_labels);
        
        if (analysisData.analisis.necesita_anclaje_general) {
            await askFinalQuestions();
        } else {
            setBudgetDetails(prev => [...prev, { label: T.summaryLabels.anchoring, value: T.no }]);
            await askForAddress();
        }
    }

    async function askFinalQuestions() {
        setStage('ask_anchoring');
        addBotMessage(T.finalQuestion);
        showOptions([{ text: T.si, value: 'si' }, { text: T.no, value: 'no' }]);
    }

    async function askForAddress() {
        setStage('ask_address');
        addBotMessage(T.askAddressMessage);
        if (inputRef.current) inputRef.current.disabled = false;
    }

    async function sendQuoteToBackend(clientAddress: string) {
        setIsTyping(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/calcular_presupuesto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analisis: storedAnalysis,
                    direccion_cliente: clientAddress,
                    language: 'es',
                    image_urls: uploadedImageUrls,
                    image_labels: imageLabels
                })
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const data = await response.json();
            
            setIsTyping(false);
            setFinalAddress(clientAddress);
            setFinalPrice(data.total_presupuesto);
            
            setFullBreakdown(data.desglose || null);

            if (uploadedImageUrls && uploadedImageUrls.length > 0 && imageLabels && imageLabels.length > 0) {
                setMessages(prev => [
                    ...prev,
                    {
                        type: 'ia-analysis',
                        text: '',
                        imageUrl: uploadedImageUrls[0],
                        labels: imageLabels
                    }
                ]);
            }

            const priceRangeStart = data.total_presupuesto;
            const priceRangeEnd = priceRangeStart + 20;
            const priceText = `€${priceRangeStart} - €${priceRangeEnd}`;

            if (isAuthenticated) {
                addBotMessage(T.confirmPublish.replace('{priceText}', priceText));
                showOptions([
                    { text: "Guardar en mi Panel", value: 'confirm_yes' },
                    { text: "Cancelar", value: 'restart' }
                ]);
                setStage('confirm_publish_loggedin');
            } else {
                // --- CAMBIO PARA EL POPUP ---
                addBotMessage(T.preRegister
                    .replace('{name}', clientName)
                    .replace('{priceText}', priceText)
                );
                // YA NO ABRIMOS EL MODAL AUTOMÁTICAMENTE
                showOptions([{ text: "Aceptar y Continuar", value: "open_register_modal" }]);
                setStage('modal_open'); 
            }
        } catch (error) {
            console.error("Error en sendQuoteToBackend:", error);
            setIsTyping(false);
            addBotMessage(T.imageError);
            showOptions([{ text: T.restartButton, value: 'restart' }]);
        }
    }

    const isInputDisabled = isTyping || options.length > 0 || stage === 'done' || stage === 'confirm_publish_loggedin' || stage === 'modal_open';
    
    const inputPlaceholder = 
        stage === 'ask_name' ? T.inputPlaceholderName :
        stage === 'ask_address' ? T.inputPlaceholderAddress :
        stage === 'awaiting_clarification_quantity' ? T.inputPlaceholderQuantity : 
        stage === 'ask_email' ? T.inputPlaceholderEmail :
        stage === 'ask_password' ? T.inputPlaceholderPassword :
        stage === 'ask_login_password' ? T.inputPlaceholderLogin :
        T.inputPlaceholderDescription;
        
    const isSendButtonDisabled = !inputValue.trim() || isInputDisabled || (stage === 'awaiting_description_after_photo' && !inputValue.trim() && !currentImageFiles);


    return (
        <div className="bg-superficie shadow-xl rounded-lg overflow-hidden flex flex-col h-full relative">

            <div
                ref={messagesContainerRef}
                id="kiq-chat-messages-full"
                className="h-96 p-6 overflow-y-auto space-y-4 bg-gray-50"
            >
                {messages.map((msg, index) => {
                    if (msg.type === 'ia-analysis') {
                        return (
                            <div key={index} className="flex justify-start w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 w-full max-w-sm">
                                    <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                                        <FaRobot className="text-acento w-5 h-5" />
                                        <span className="font-semibold text-gray-800 text-sm">Análisis de IA</span>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                            {msg.imageUrl ? (
                                                <img 
                                                    src={msg.imageUrl} 
                                                    alt="Mueble analizado" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FaImage size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap content-start gap-2">
                                            {msg.labels && msg.labels.map((label, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200"
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div
                                className={`rounded-2xl px-4 py-3 max-w-xs shadow-sm ${
                                    msg.type === 'user'
                                        ? 'bg-primario-oscuro text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in zoom-in duration-200">
                        <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-white border border-gray-100 shadow-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                <RegisterInChatModal 
                    isOpen={isRegisterModalOpen}
                    onClose={() => setIsRegisterModalOpen(false)}
                    prefilledName={clientName}
                    registrationData={{
                        descripcion: currentTextDescription,
                        direccion: finalAddress,
                        precio_calculado: finalPrice,
                        imagenes: uploadedImageUrls,
                        etiquetas: imageLabels,
                        desglose: fullBreakdown
                    }}
                    onSuccess={(token: string, email: string) => {
                        localStorage.setItem('accessToken', token);
                        setIsRegisterModalOpen(false);
                        addBotMessage(T.publishSuccess);
                        setTimeout(() => {
                            if (onPublishSuccess) onPublishSuccess();
                            window.location.href = '/panel-cliente';
                        }, 2000);
                    }}
                />

            </div>

            <div id="kiq-chat-options-full" className="p-4 bg-white border-t border-gray-100 flex flex-wrap gap-2 justify-center min-h-[80px]">
                {options.map((opt) => {
                    if (opt.href) {
                        return (<a key={opt.value} href={opt.href} target={opt.isExternal ? '_blank' : '_self'} rel="noopener noreferrer" className="bg-green-500 text-white font-bold py-2 px-4 rounded-full transition-transform hover:scale-105 inline-flex items-center gap-2 shadow-md"> {opt.text} </a>)
                    }
                    return (
                        <button
                            key={opt.value}
                            className={`font-bold py-2 px-4 rounded-full transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                                opt.value === 'confirm_yes' || opt.value === 'open_register_modal' ? 'bg-acento text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => handleOptionClick(opt)}
                        >
                            {opt.text}
                        </button>
                    )
                })}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center">
                <button
                    id="kiq-attach-button"
                    className="p-2 text-gray-400 hover:text-acento transition-colors"
                    style={{ display: (stage === 'describe' || stage === 'awaiting_photo_option' || (stage === 'describe' && isAuthenticated)) ? 'block' : 'none' }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FaPaperclip className="w-5 h-5" />
                </button>
                <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />

                <input
                    ref={inputRef}
                    id="kiq-user-input"
                    type={stage === 'ask_password' || stage === 'ask_login_password' ? 'password' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={inputPlaceholder}
                    className="flex-grow px-4 py-3 mx-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-acento focus:border-transparent transition-all"
                    disabled={isInputDisabled}
                />

                <button
                    id="kiq-send-button"
                    className="p-3 bg-acento text-white rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSend}
                    disabled={isSendButtonDisabled}
                >
                    <FaPaperPlane className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
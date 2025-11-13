// En: src/app/components/ChatCalculadora.tsx (¡CON ENLACES DE FOTOS EN WHATSAPP!)

"use client"; 
import { useState, useEffect, useRef } from 'react';
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

// --- Definimos los "tipos" ---
type Message = {
  type: 'bot' | 'user' | 'loading' | 'summary';
  text: string;
  html?: string;
};
type Option = {
  text: string;
  value: string;
  href?: string;
  isExternal?: boolean;
};
type Analysis = any; 
type BudgetDetail = {
  label: string;
  value: string;
};

// --- Diccionario de Textos (MIGRADO DE traductor.js) ---
const T = {
  inputPlaceholderName: "Escribe tu nombre...",
  welcomeName: "¡Hola! Soy el asistente virtual de KIQ. Para empezar, ¿cómo te llamas?",
  welcomeUser: "¡Genial, {name}! Ahora cuéntame qué necesitas montar. Puedes describirlo o subir una foto.",
  inputPlaceholderDescription: "Ej: Montar un armario PAX de 2 puertas y una cómoda",
  askForPhoto: "¿Quieres añadir una foto para que el presupuesto sea más preciso?",
  yesAddPhoto: "Sí, añadir foto",
  noContinue: "No, continuar solo con texto",
  askForDescriptionAfterPhoto: "¡Foto/s recibida/s! Ahora, añade una breve descripción (o pulsa enviar).",
  processingImage: "Analizando la/s imagen/es, un momento...",
  processingDescription: "Analizando tu descripción...",
  imageError: "Lo siento, ha habido un problema al procesar la imagen. Vamos a intentarlo solo con la descripción de texto. Por favor, descríbeme qué necesitas.",
  finalQuestion: "Entendido. Una última pregunta: ¿el mueble (o alguno de ellos) necesita anclarse a la pared?",
  si: "Sí",
  no: "No",
  askAddressMessage: "Perfecto. Por último, para calcular el desplazamiento, ¿podrías indicarme tu código postal o la zona/barrio de Málaga?",
  inputPlaceholderAddress: "Ej: 29010 o Teatinos",
  processingAddress: "Calculando la ruta...",
  finalTitle: "Resumen de tu Presupuesto Estimado",
  summaryLabels: {
    anchoring: "Anclaje a pared",
    clientName: "Cliente",
    address: "Dirección"
  },
  finalContact: "¡Para confirmar los detalles y reservar una fecha, la forma más rápida es enviarnos este resumen por WhatsApp.",
  whatsappMessage: "¡Hola KIQ! 👋 He usado vuestra calculadora y me gustaría confirmar este presupuesto:\n\n*{summaryTitle}*\n{summary}\n\n*Precio Estimado: {priceText}*",
  whatsappButton: "Confirmar por WhatsApp",
  restartButton: "Calcular otro presupuesto",
  summaryTitle: "RESUMEN DEL SERVICIO",
  // --- ¡NUEVO! Textos para el resumen de WhatsApp ---
  photoLabel: "Fotos de referencia",
  photoReceived: "imágenes recibidas",
  seeFirstPhoto: "Ver la primera",
};

// --- URL de tu API (de tu traductor.js) ---
const API_BASE_URL = 'https://kiq-calculadora.onrender.com';

export default function ChatCalculadora() {
  // --- Estados de React (la "memoria" del chat) ---
  const [stage, setStage] = useState('start'); 
  const [clientName, setClientName] = useState('');
  const [currentTextDescription, setCurrentTextDescription] = useState('');
  const [currentImageFiles, setCurrentImageFiles] = useState<FileList | null>(null);
  const [inputValue, setInputValue] = useState(''); 
  const [messages, setMessages] = useState<Message[]>([]); 
  const [options, setOptions] = useState<Option[]>([]);
  const [budgetDetails, setBudgetDetails] = useState<BudgetDetail[]>([]);
  const [storedAnalysis, setStoredAnalysis] = useState<Analysis>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[] | null>(null);
  const [imageLabels, setImageLabels] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Referencias a elementos ---
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Función de Scroll ---
  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, options, isLoading]);

  // --- Función de Inicio (startChat) ---
  useEffect(() => {
    startChat();
  }, []); 

  const startChat = () => {
    setStage('start');
    setClientName('');
    setCurrentTextDescription('');
    setCurrentImageFiles(null);
    setInputValue('');
    setMessages([]);
    setOptions([]);
    setBudgetDetails([]);
    setStoredAnalysis(null);
    setUploadedImageUrls(null);
    setImageLabels(null);
    setIsLoading(false);

    setMessages([{ type: 'bot', text: T.welcomeName }]);
    setStage('ask_name');
  }

  // --- Funciones de Ayuda del Chat ---
  const addBotMessage = (text: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev.filter(m => m.type !== 'loading'), { type: 'bot', text: text }]);
      setIsLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }, 800);
  };
  
  const showOptions = (newOptions: Option[]) => {
    setTimeout(() => setOptions(newOptions), 900);
  };

  const addUserMessage = (text: string) => {
    const newUserMessage: Message = { type: 'user', text: text };
    setMessages(prev => [...prev, newUserMessage]);
    return newUserMessage;
  };
  
  // --- Lógica del Chatbot (Migración COMPLETA) ---

  // Etapa 1: Enviar Texto (handleTextInput)
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text && stage !== 'awaiting_description_after_photo') return;

    addUserMessage(text);
    setInputValue('');
    setIsLoading(true);

    if (stage === 'ask_name') {
      setClientName(text); 
      addBotMessage(T.welcomeUser.replace('{name}', text));
      setStage('describe'); 
      
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
      await processInitialAnalysis(analysisData);
      
    } else if (stage === 'ask_address') {
      await sendQuoteToBackend(text); // 'text' es la dirección
    }
  };

  // Etapa 2: Clic en Opción (handleOptionClick)
  const handleOptionClick = async (option: Option) => {
    addUserMessage(option.text);
    setOptions([]);
    setIsLoading(true);

    if (stage === 'awaiting_photo_option') {
      if (option.value === 'yes_photo') {
        fileInputRef.current?.click();
        setIsLoading(false);
      } else {
        const analysisData = await sendDataToBackend(currentTextDescription, null);
        await processInitialAnalysis(analysisData);
      }
    } else if (stage === 'ask_anchoring') {
      setBudgetDetails(prev => [...prev, { label: T.summaryLabels.anchoring, value: option.text }]);
      await askForAddress();
    } else if (option.value === 'restart') {
      startChat();
    }
  };

  // Etapa 3: Subida de Imagen (handleImageUpload)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = event.target.files;
    setCurrentImageFiles(files);
    
    let fileNames = Array.from(files).map(f => f.name);
    addUserMessage(`🖼️ Archivo/s subido/s: ${fileNames.join(', ')}`);
    setIsLoading(true);
    setOptions([]);

    if (currentTextDescription) {
      const analysisData = await sendDataToBackend(currentTextDescription, files);
      await processInitialAnalysis(analysisData);
    } else {
      addBotMessage(T.askForDescriptionAfterPhoto);
      setStage('awaiting_description_after_photo');
      setIsLoading(false);
    }
  };

  // Etapa 4: Llamar a la API (sendDataToBackend)
  async function sendDataToBackend(text: string, files: FileList | null) {
    const formData = new FormData();
    formData.append('descripcion_texto_mueble', text);
    formData.append('language', 'es'); 
    formData.append('client_name', clientName);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append('imagen', files[i]);
      }
    }

    const message = (files && files.length > 0) ? T.processingImage : T.processingDescription;
    setMessages(prev => [...prev, { type: 'loading', text: message }]);

    try {
      const response = await fetch(`${API_BASE_URL}/calcular_presupuesto`, {
          method: 'POST',
          body: formData
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
      return await response.json(); 
    } catch (error) {
      console.error("Error en sendDataToBackend:", error);
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
      addBotMessage(T.imageError);
      setStage('describe'); 
      return null;
    }
  }

  // Etapa 5: Procesar Respuesta de API (processInitialAnalysis)
  async function processInitialAnalysis(analysisData: any) {
    if (!analysisData || !analysisData.analisis) {
      console.error("Error: Análisis inicial no válido.");
      addBotMessage(T.imageError);
      setStage('describe');
      return;
    }

    setStoredAnalysis(analysisData.analisis);
    setUploadedImageUrls(analysisData.image_urls); // <-- ¡Guardamos las URLs!
    setImageLabels(analysisData.image_labels);

    if (analysisData.analisis.necesita_anclaje_general) {
      await askFinalQuestions();
    } else {
      setBudgetDetails(prev => [...prev, { label: T.summaryLabels.anchoring, value: T.no }]);
      await askForAddress();
    }
  }

  // Etapa 6: Preguntar por Anclaje
  async function askFinalQuestions() {
    setStage('ask_anchoring');
    addBotMessage(T.finalQuestion);
    showOptions([{ text: T.si, value: 'si' }, { text: T.no, value: 'no' }]);
  }

  // Etapa 7: Preguntar por Dirección
  async function askForAddress() {
    setStage('ask_address');
    addBotMessage(T.askAddressMessage);
    if (inputRef.current) inputRef.current.disabled = false;
  }
  
  // Etapa 8: Calcular Presupuesto Final (sendQuoteToBackend)
  async function sendQuoteToBackend(clientAddress: string) {
    setMessages(prev => [...prev, { type: 'loading', text: T.processingAddress }]);
    setStage('done');
    
    try {
      const response = await fetch(`${API_BASE_URL}/calcular_presupuesto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analisis: storedAnalysis,
          direccion_cliente: clientAddress,
          language: 'es',
          image_urls: uploadedImageUrls, // <-- ¡Enviamos las URLs de vuelta!
          image_labels: imageLabels
        })
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      const data = await response.json();
      
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
      showSummary(data, clientAddress); // ¡Llamamos al resumen!

    } catch (error) {
      console.error("Error en sendQuoteToBackend:", error);
      setMessages(prev => prev.filter(m => m.type !== 'loading'));
      addBotMessage(T.imageError);
      showOptions([{ text: T.restartButton, value: 'restart' }]);
    }
  }

  // --- ¡Etapa 9: Mostrar el Resumen (AHORA CON FOTOS)! ---
  const showSummary = (data: any, clientAddress: string) => {
    // 1. Construir el Resumen en HTML (para el chat)
    const priceRangeStart = data.precio_estimado;
    const priceRangeEnd = priceRangeStart + 20;
    
    let desgloseList = "";
    if (data.desglose && data.desglose.length > 0) {
      desgloseList = "<ul>" + 
        data.desglose.map((item: any) => 
          `<li><span>${item.item} (x${item.cantidad})</span> <span><strong>${item.precio}€</strong></span></li>`
        ).join('') + 
      "</ul>";
    }
    
    let distanciaHtml = '';
    if (data.zona_desplazamiento_info && data.zona_desplazamiento_info.includes('km')) {
      distanciaHtml = `<p class="distancia-info"><span>Distancia aproximada:</span> <span>${data.zona_desplazamiento_info}</span></p>`;
    }
    
    const summaryCardHtml = `
      <div class="summary-card">
        <h3>${T.finalTitle}</h3>
        ${desgloseList}
        ${distanciaHtml}
        <div class="summary-total">
          <span>Total Estimado</span>
          <span>${priceRangeStart}€ - ${priceRangeEnd}€</span>
        </div>
      </div>
    `;
    
    setMessages(prev => [...prev, {
      type: 'summary',
      text: 'Aquí está tu resumen',
      html: summaryCardHtml
    }]);

    // 2. Construir el Mensaje de WhatsApp (¡CON LOS ENLACES!)
    let desgloseText = "";
    if (data.desglose && data.desglose.length > 0) {
      data.desglose.forEach((item: any) => {
        desgloseText += `- ${item.item} (x${item.cantidad}): ${item.precio}€\n`;
      });
    }
    
    let summaryDetails = `- Descripción: ${currentTextDescription}\n${desgloseText}`;
    summaryDetails += `\n- ${T.summaryLabels.clientName}: ${clientName}`;
    summaryDetails += `\n- ${T.summaryLabels.address}: ${clientAddress}`;
    
    const anchoringInfo = budgetDetails.find(detail => detail.label === T.summaryLabels.anchoring);
    if (anchoringInfo) {
      summaryDetails += `\n- ${anchoringInfo.label}: ${anchoringInfo.value}`;
    }
    if (data.zona_desplazamiento_info && data.zona_desplazamiento_info.includes('km')) {
      summaryDetails += `\n- Distancia: ${data.zona_desplazamiento_info}`;
    }

    // --- ¡¡AQUÍ ESTÁ LA MEJORA!! ---
    // (Lógica migrada de tu traductor.js)
    // data.image_urls es lo que recibimos de la API
    if (data.image_urls && data.image_urls.length > 0) {
      summaryDetails += `\n- ${T.photoLabel}: ${data.image_urls.length} ${T.photoReceived}`;
      // Añadimos solo el primer enlace acortado
      summaryDetails += `\n  ${T.seeFirstPhoto}: ${data.image_urls[0]}`; 
    }
    // --- FIN DE LA MEJORA ---

    const priceText = `€${priceRangeStart} - €${priceRangeEnd}`;
    let summaryText = T.whatsappMessage
        .replace('{summaryTitle}', T.summaryTitle)
        .replace('{summary}', summaryDetails)
        .replace('{priceText}', priceText);
    const encodedMessage = encodeURIComponent(summaryText);

    // 3. Mostrar los botones finales
    addBotMessage(T.finalContact);
    showOptions([
      { 
        text: T.whatsappButton, 
        value: 'nav_whatsapp', 
        href: `https://wa.me/34664497889?text=${encodedMessage}`, // ¡Tu número!
        isExternal: true
      },
      { text: T.restartButton, value: 'restart' }
    ]);
  };

  // --- Interfaz del Chat (HTML/JSX) ---
  return (
    <div className="bg-superficie shadow-xl rounded-lg overflow-hidden">
      
      {/* 1. Área de Mensajes */}
      <div 
        ref={messagesContainerRef}
        id="kiq-chat-messages-full" 
        className="h-96 p-6 overflow-y-auto space-y-4"
      >
        {messages.map((msg, index) => {
          if (msg.type === 'loading') {
            return (
              <div key={index} className="flex justify-start">
                <div className="rounded-lg px-4 py-3 max-w-xs bg-fondo text-texto-principal italic">
                  {msg.text}
                </div>
              </div>
            );
          }
          // --- ¡NUEVO! Renderiza la tarjeta de resumen ---
          if (msg.type === 'summary') {
            return (
              <div 
                key={index}
                className="summary-card-wrapper" 
                dangerouslySetInnerHTML={{ __html: msg.html || '' }} 
              />
            );
          }
          return (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`rounded-lg px-4 py-3 max-w-xs
                  ${msg.type === 'user' 
                    ? 'bg-primario-oscuro text-superficie' 
                    : 'bg-fondo text-texto-principal'
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Área de Opciones (Botones) */}
      <div id="kiq-chat-options-full" className="p-4 flex flex-wrap gap-2 justify-center border-t border-gray-100">
        {options.map((opt) => {
          // Si el botón es un enlace (WhatsApp)
          if (opt.href) {
            return (
              <a
                key={opt.value}
                href={opt.href}
                target={opt.isExternal ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-full transition-transform hover:scale-105 inline-flex items-center gap-2"
                onClick={() => { if (opt.value === 'nav_whatsapp') setIsLoading(true); }} // Opcional: mostrar carga
              >
                <FaWhatsapp /> {opt.text}
              </a>
            )
          }
          // Si es un botón de acción (Sí, No, Reiniciar)
          return (
            <button
              key={opt.value}
              className="bg-acento text-primario-oscuro font-bold py-2 px-4 rounded-full transition-transform hover:scale-105"
              onClick={() => handleOptionClick(opt)}
            >
              {opt.text}
            </button>
          )
        })}
      </div>

      {/* 3. Área de Input */}
      <div className="p-4 bg-fondo border-t border-gray-200 flex items-center">
        
        {/* Botón de Adjuntar (Clip) */}
        <button 
          id="kiq-attach-button" 
          className="p-2 text-texto-secundario hover:text-primario-oscuro"
          style={{ display: (stage === 'describe' || stage === 'awaiting_photo_option') ? 'block' : 'none' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <FaPaperclip className="w-5 h-5" />
        </button>
        
        {/* Input de Archivo (Oculto) */}
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept="image/*" // Aceptar solo imágenes
          className="hidden" 
          onChange={handleImageUpload} 
        />
        
        {/* Input de Texto */}
        <input 
          ref={inputRef}
          id="kiq-user-input"
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            stage === 'ask_name' ? T.inputPlaceholderName : 
            stage === 'ask_address' ? T.inputPlaceholderAddress : 
            T.inputPlaceholderDescription
          }
          className="flex-grow px-4 py-2 mx-2 bg-superficie border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-acento"
          disabled={isLoading || options.length > 0 || stage === 'done'} 
        />
        
        {/* Botón de Enviar */}
        <button 
          id="kiq-send-button"
          className="p-3 bg-acento text-primario-oscuro rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading || options.length > 0 || stage === 'done' || (stage === 'awaiting_description_after_photo' && !inputValue.trim() && !currentImageFiles)}
        >
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
'use client';
import { useState, useRef } from 'react';
import { FaTimes, FaCamera, FaTag, FaMapMarkerAlt, FaAlignLeft, FaEuroSign } from 'react-icons/fa';
import { useUI } from '../context/UIContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

interface VenderItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Para recargar la lista o avisar
}

export default function VenderItemModal({ isOpen, onClose, onSuccess }: VenderItemModalProps) {
  const { accessToken } = useUI();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    precio: '',
    descripcion: '',
    ubicacion: 'Málaga', // Default por ahora
    imagen: null as File | null
  });

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, imagen: file });
      setPreviewUrl(URL.createObjectURL(file)); // Preview instantáneo
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.precio || !formData.imagen) {
      alert("Título, precio y foto son obligatorios");
      return;
    }

    setIsLoading(true);
    
    try {
      const data = new FormData();
      data.append('titulo', formData.titulo);
      data.append('precio', formData.precio);
      data.append('descripcion', formData.descripcion);
      data.append('ubicacion', formData.ubicacion);
      data.append('imagen', formData.imagen);

      const res = await fetch(`${API_BASE_URL}/api/outlet/publicar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
          // No ponemos Content-Type porque FormData lo pone automático con el boundary
        },
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        onSuccess(); // Avisar al padre
        onClose(); // Cerrar modal
        // Limpieza
        setFormData({ titulo: '', precio: '', descripcion: '', ubicacion: 'Málaga', imagen: null });
        setPreviewUrl(null);
      } else {
        alert(result.error || "Error al publicar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="bg-indigo-900 text-white p-4 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FaTag className="text-yellow-400" /> Vender Artículo
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <FaTimes />
          </button>
        </div>

        {/* Formulario Scrollable */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Área de FOTO (La protagonista) */}
            <div 
              className="relative w-full aspect-video bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition group overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <p className="text-white font-bold flex items-center gap-2"><FaCamera /> Cambiar Foto</p>
                   </div>
                </>
              ) : (
                <>
                  <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-2 group-hover:scale-110 transition">
                    <FaCamera size={24} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Toca para subir foto</p>
                  <p className="text-xs text-gray-400">Muebles, electrodomésticos...</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </div>

            {/* Campos de Texto */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">¿Qué vendes?</label>
              <input 
                type="text" 
                placeholder="Ej: Sofá cama IKEA 3 plazas" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio (€)</label>
                    <div className="relative">
                        <FaEuroSign className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600 text-lg"
                            value={formData.precio}
                            onChange={(e) => setFormData({...formData, precio: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ubicación</label>
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                        <input 
                            type="text" 
                            placeholder="Ciudad" 
                            className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                            value={formData.ubicacion}
                            onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción (Estado)</label>
              <div className="relative">
                 <FaAlignLeft className="absolute left-3 top-3.5 text-gray-400 text-sm"/>
                 <textarea 
                    placeholder="Ej: Tiene una pequeña mancha, pero estructura perfecta. Lo retiré de una mudanza hoy." 
                    className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                 />
              </div>
            </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading ? 'Publicando...' : <><FaTag /> Publicar en Outlet</>}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
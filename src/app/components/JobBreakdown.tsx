import { FaToolbox } from "react-icons/fa";

// Interfaces adaptadas a tu estructura de datos actual
interface ItemDesglose {
  item: string;
  cantidad: number;
  subtotal: number;
}

interface BreakdownProps {
  desglose: {
    muebles_cotizados: ItemDesglose[];
    distancia_km: string;
    coste_desplazamiento: number;
    coste_anclaje_estimado: number;
  };
  precioFinal: number;
  // 'total' muestra "Total Final", 'recibir' muestra "Total a Recibir"
  modo: 'total' | 'recibir'; 
}

export default function JobBreakdown({ desglose, precioFinal, modo }: BreakdownProps) {
  const format = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  return (
    <div className="bg-gray-50 rounded-xl p-4 mt-4 text-sm border border-gray-100">
      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
        <FaToolbox className="text-indigo-500"/> Detalle del Servicio
      </h4>
      
      <ul className="space-y-2 text-xs">
        {/* Lista de Muebles */}
        {desglose.muebles_cotizados.map((item, i) => (
          <li key={i} className="flex justify-between text-gray-600">
            <span>{item.cantidad}x {item.item}</span>
            <span className="font-medium text-gray-900">{format(item.subtotal)}</span>
          </li>
        ))}
        
        <li className="border-t border-gray-200 my-2 opacity-50"></li>
        
        {/* Costes Extra */}
        <li className="flex justify-between text-gray-500">
          <span>Desplazamiento ({desglose.distancia_km})</span>
          <span className="font-medium text-gray-900">{format(desglose.coste_desplazamiento)}</span>
        </li>
        
        {desglose.coste_anclaje_estimado > 0 && (
          <li className="flex justify-between text-gray-500">
            <span>Anclaje a pared</span>
            <span className="font-medium text-gray-900">{format(desglose.coste_anclaje_estimado)}</span>
          </li>
        )}

        {/* Total Final */}
        <li className="flex justify-between pt-3 mt-2 font-bold text-base text-gray-900 border-t border-gray-300">
          <span>{modo === 'recibir' ? 'Total a Recibir' : 'Total Final'}</span>
          <span className="text-green-600">{format(precioFinal)}</span>
        </li>
      </ul>
    </div>
  );
}
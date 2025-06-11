import React from 'react';

interface Lesion {
  id: string;
  type: string;
  x: number;
  y: number;
  side: 'front' | 'back';
  color?: string;
}

interface BodyMapProps {
  lesions: Lesion[];
  side: 'front' | 'back';
  onSideChange?: (side: 'front' | 'back') => void;
  showSwitch?: boolean;
}

const lesionColors: Record<string, string> = {
  '1': '#ef4444', // Hemorragia
  '2': '#8b5cf6', // Herida
  '3': '#3b82f6', // Contusión
  '4': '#f59e0b', // Fractura
  '5': '#10b981', // Luxación/Esguince
  '6': '#6b7280', // Objeto extraño
  '7': '#dc2626', // Quemadura
  '8': '#059669', // Picadura/Mordedura
  '9': '#7c3aed', // Edema/Hematoma
  '10': '#1f2937', // Otro
};

export const BodyMap: React.FC<BodyMapProps> = ({ lesions, side, onSideChange, showSwitch = true }) => {
  return (
    <div className="flex flex-col items-center">
      {showSwitch && (
        <div className="mb-2 flex gap-2">
          <button
            className={`px-2 py-1 rounded text-xs border ${side === 'front' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
            onClick={() => onSideChange && onSideChange('front')}
            type="button"
          >
            Anverso
          </button>
          <button
            className={`px-2 py-1 rounded text-xs border ${side === 'back' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
            onClick={() => onSideChange && onSideChange('back')}
            type="button"
          >
            Reverso
          </button>
        </div>
      )}
      <svg
        width="180"
        height="360"
        viewBox="0 0 200 400"
        className="max-w-full h-auto"
      >
        {side === 'front' ? (
          <g>
            {/* Cabeza */}
            <ellipse cx="100" cy="30" rx="25" ry="30" fill="none" stroke="#666" strokeWidth="2" />
            {/* Cuello */}
            <rect x="92" y="55" width="16" height="15" fill="none" stroke="#666" strokeWidth="2" />
            {/* Torso */}
            <ellipse cx="100" cy="120" rx="45" ry="50" fill="none" stroke="#666" strokeWidth="2" />
            {/* Brazos */}
            <ellipse cx="60" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="140" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            {/* Antebrazos */}
            <ellipse cx="45" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="155" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2" />
            {/* Manos */}
            <ellipse cx="40" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="160" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2" />
            {/* Pelvis */}
            <ellipse cx="100" cy="180" rx="35" ry="20" fill="none" stroke="#666" strokeWidth="2" />
            {/* Muslos */}
            <ellipse cx="85" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="115" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2" />
            {/* Pantorrillas */}
            <ellipse cx="80" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="120" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            {/* Pies */}
            <ellipse cx="75" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="125" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2" />
          </g>
        ) : (
          <g>
            {/* Cabeza */}
            <ellipse cx="100" cy="30" rx="25" ry="30" fill="none" stroke="#666" strokeWidth="2" />
            {/* Cuello */}
            <rect x="92" y="55" width="16" height="15" fill="none" stroke="#666" strokeWidth="2" />
            {/* Torso posterior */}
            <ellipse cx="100" cy="120" rx="45" ry="50" fill="none" stroke="#666" strokeWidth="2" />
            {/* Brazos posteriores */}
            <ellipse cx="60" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="140" cy="100" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            {/* Antebrazos posteriores */}
            <ellipse cx="45" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="155" cy="160" rx="10" ry="35" fill="none" stroke="#666" strokeWidth="2" />
            {/* Manos posteriores */}
            <ellipse cx="40" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="160" cy="200" rx="8" ry="15" fill="none" stroke="#666" strokeWidth="2" />
            {/* Pelvis posterior */}
            <ellipse cx="100" cy="180" rx="35" ry="20" fill="none" stroke="#666" strokeWidth="2" />
            {/* Muslos posteriores */}
            <ellipse cx="85" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="115" cy="240" rx="15" ry="45" fill="none" stroke="#666" strokeWidth="2" />
            {/* Pantorrillas posteriores */}
            <ellipse cx="80" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="120" cy="310" rx="12" ry="40" fill="none" stroke="#666" strokeWidth="2" />
            {/* Pies posteriores */}
            <ellipse cx="75" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2" />
            <ellipse cx="125" cy="365" rx="15" ry="10" fill="none" stroke="#666" strokeWidth="2" />
            {/* Línea de la espalda */}
            <line x1="100" y1="70" x2="100" y2="170" stroke="#666" strokeWidth="1" />
          </g>
        )}
        {/* Lesiones marcadas */}
        {lesions
          .filter((l) => l.side === side)
          .map((lesion) => (
            <circle
              key={lesion.id}
              cx={lesion.x * 2}
              cy={lesion.y * 4}
              r="7"
              fill={lesionColors[lesion.type] || '#000'}
              stroke="#fff"
              strokeWidth="2"
              opacity="0.85"
            />
          ))}
      </svg>
    </div>
  );
}; 
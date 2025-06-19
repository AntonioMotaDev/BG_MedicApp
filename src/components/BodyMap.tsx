import React from 'react';

interface Lesion {
  id: string;
  type: string;
  x: number;
  y: number;
  side: 'front' | 'back';
  color?: string;
  order?: number;
}

interface BodyMapProps {
  lesions: Lesion[];
  side: 'front' | 'back';
  onSideChange?: (side: 'front' | 'back') => void;
  showSwitch?: boolean;
  onBodyClick?: (event: React.MouseEvent<SVGElement>) => void;
  onLesionClick?: (lesionId: string) => void;
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

export const BodyMap: React.FC<BodyMapProps> = ({ lesions, side, onSideChange, showSwitch = false, onBodyClick, onLesionClick }) => {
  // Tamaño aumentado 25% (de 200px a 250px)
  const imageWidth = 250;
  const imageHeight = 208; // Proporcionalmente ajustado basado en 618x515 -> 250x208

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-block">
        {/* Imagen del cuerpo humano */}
        <img
          src="/images/cuerpo-humano.jpg"
          alt="Cuerpo humano - Vista frontal y posterior"
          className="max-w-full h-auto border"
          style={{ 
            width: `${imageWidth}px`, 
            height: 'auto'
          }}
        />
        
        {/* SVG overlay para las lesiones */}
        <svg
          width={imageWidth}
          height={imageHeight}
          viewBox={`0 0 ${imageWidth} ${imageHeight}`}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
          onClick={(e) => {
            if (onBodyClick) {
              // Obtener las coordenadas exactas relativas al SVG
              const svgRect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - svgRect.left) / svgRect.width) * 100;
              const y = ((e.clientY - svgRect.top) / svgRect.height) * 100;
              
              // Crear evento sintético con las coordenadas correctas
              const syntheticEvent = {
                ...e,
                currentTarget: {
                  ...e.currentTarget,
                  getBoundingClientRect: () => ({
                    left: 0,
                    top: 0,
                    width: 100,
                    height: 100,
                    right: 100,
                    bottom: 100,
                    x: 0,
                    y: 0,
                    toJSON: () => ({})
                  })
                },
                clientX: x,
                clientY: y
              } as React.MouseEvent<SVGElement>;
              
              onBodyClick(syntheticEvent);
            }
          }}
        >
          {/* Área transparente clickeable */}
          <rect
            x="0"
            y="0"
            width={imageWidth}
            height={imageHeight}
            fill="transparent"
            className="cursor-crosshair"
          />
          
          {/* Lesiones marcadas con numeración */}
          {lesions
            .map((lesion, index) => {
              const centerX = (lesion.x / 100) * imageWidth;
              const centerY = (lesion.y / 100) * imageHeight;
              
              return (
                <g key={lesion.id}>
                  {/* Círculo de la lesión */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="12"
                    fill={lesionColors[lesion.type] || '#000'}
                    stroke="#fff"
                    strokeWidth="2"
                    opacity="0.85"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLesionClick && onLesionClick(lesion.id);
                    }}
                  />
                  {/* Número de la lesión */}
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {lesion.order || index + 1}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
      
      <div className="mt-2 text-xs text-gray-600 text-center">
        <p>Haga clic en el cuerpo para marcar lesiones</p>
        <p>Vuelva a hacer clic en la lesión para eliminarla</p>
      </div>
    </div>
  );
}; 
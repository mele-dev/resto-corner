interface LogoProps {
  className?: string;
  height?: number;
}

export default function Logo({ className = '', height = 40 }: LogoProps) {
  const width = height * 1.2; // Proporción aproximada
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Sombrero de chef */}
      <g>
        {/* Parte superior del sombrero (puffy top) - más redondeada */}
        <path
          d="M 30 25 Q 30 10 35 10 L 85 10 Q 90 10 90 25 L 90 38 Q 90 43 85 43 L 35 43 Q 30 43 30 38 Z"
          fill="white"
          stroke="black"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Banda del sombrero */}
        <rect
          x="30"
          y="38"
          width="60"
          height="10"
          fill="white"
          stroke="black"
          strokeWidth="3.5"
          rx="1"
        />
        {/* Tenedor y cuchillo cruzados en la banda - más simples y centrados */}
        <g transform="translate(60, 43)">
          {/* Tenedor (simplificado) */}
          <line x1="-7" y1="-3" x2="-7" y2="3" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <line x1="-9" y1="0" x2="-5" y2="0" stroke="black" strokeWidth="2" strokeLinecap="round" />
          {/* Cuchillo (simplificado) */}
          <line x1="7" y1="-3" x2="7" y2="3" stroke="black" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="-2" x2="9" y2="2" stroke="black" strokeWidth="1.5" />
          <line x1="5" y1="2" x2="9" y2="-2" stroke="black" strokeWidth="1.5" />
        </g>
      </g>

      {/* Tablet (inclinada ligeramente a la derecha) */}
      <g transform="translate(0, 52) rotate(5 60 26)">
        {/* Marco de la tablet - más grueso */}
        <rect
          x="18"
          y="8"
          width="84"
          height="36"
          rx="4"
          fill="white"
          stroke="black"
          strokeWidth="3.5"
        />
        {/* Pantalla de la tablet (área blanca) */}
        <rect
          x="22"
          y="12"
          width="76"
          height="28"
          rx="2"
          fill="white"
        />
        {/* Botón home (circular en la parte inferior del marco) */}
        <circle
          cx="60"
          cy="50"
          r="4"
          fill="black"
        />
        {/* Texto RiDi Express - mejor posicionado */}
        <text
          x="60"
          y="30"
          textAnchor="middle"
          fontSize="12"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          letterSpacing="0.3"
        >
          <tspan fill="#D97706">RiDi</tspan>
          <tspan fill="#9CA3AF"> Express</tspan>
        </text>
        {/* Línea subrayada (ligeramente curva) */}
        <path
          d="M 32 35 Q 60 37 88 35"
          stroke="#D97706"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

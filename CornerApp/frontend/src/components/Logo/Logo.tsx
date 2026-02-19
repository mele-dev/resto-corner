
interface LogoProps {
  className?: string;
  showText?: boolean;
  height?: number;
  variant?: 'full' | 'text-only';
}

export default function Logo({ className = '', showText = true, height = 50, variant = 'text-only' }: LogoProps) {
  const width = height * 1.2;
  
  // Si es solo texto, mostrar solo el texto sin el SVG
  if (variant === 'text-only') {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-2xl font-bold">
          <span className="text-[#D97706]">RiDi</span>
          <span className="text-[#9CA3AF]"> Express</span>
        </span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Chef's Hat */}
        <g>
          {/* Main hat body - puffy style */}
          <path
            d="M 30 20 Q 30 8 35 8 L 85 8 Q 90 8 90 20 L 90 35 Q 90 40 85 40 L 35 40 Q 30 40 30 35 Z"
            fill="none"
            stroke="black"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Hat band */}
          <rect
            x="30"
            y="35"
            width="60"
            height="8"
            fill="none"
            stroke="black"
            strokeWidth="3.5"
            rx="1"
          />
          
          {/* Fork and Knife icon on band - crossed */}
          <g transform="translate(60, 39)">
            {/* Fork (left side) */}
            <line x1="-6" y1="-2" x2="-6" y2="2" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="-8" y1="-1" x2="-4" y2="-1" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="-7" y1="-3" x2="-5" y2="-3" stroke="black" strokeWidth="1.5" />
            {/* Knife (right side) */}
            <line x1="6" y1="-2" x2="6" y2="2" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="-2" x2="8" y2="2" stroke="black" strokeWidth="1.5" />
            <line x1="4" y1="2" x2="8" y2="-2" stroke="black" strokeWidth="1.5" />
          </g>
        </g>

        {/* Tablet/Smartphone - tilted slightly */}
        <g transform="translate(0, 48) rotate(5 60 26)">
          {/* Device frame */}
          <rect
            x="18"
            y="8"
            width="84"
            height="36"
            rx="4"
            fill="none"
            stroke="black"
            strokeWidth="3.5"
          />
          
          {/* Screen area - keep white for text visibility */}
          <rect
            x="22"
            y="12"
            width="76"
            height="28"
            rx="2"
            fill="white"
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Home button/Camera - circular at bottom center */}
          <circle
            cx="60"
            cy="50"
            r="4"
            fill="black"
          />
          
          {/* Text "RiDi Express" inside screen */}
          <g transform="translate(60, 28)">
            {/* RiDi text in orange-brown (#D97706) */}
            <text
              x="0"
              y="0"
              fontSize="11"
              fontWeight="bold"
              fill="#D97706"
              fontFamily="Arial, sans-serif"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              RiDi
            </text>
            
            {/* Express text in light gray (#9CA3AF) */}
            <text
              x="0"
              y="12"
              fontSize="9"
              fill="#9CA3AF"
              fontFamily="Arial, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              Express
            </text>
            
            {/* Underline in orange-brown - slightly curved */}
            <path
              d="M -18 14 Q 0 16 18 14"
              stroke="#D97706"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
      
      {showText && (
        <span className="text-xl font-bold text-gray-800">RiDi Express</span>
      )}
    </div>
  );
}

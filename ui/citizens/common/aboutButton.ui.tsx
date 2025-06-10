import { useState } from 'react';

interface AboutButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function AboutButton({ className = '', onClick }: AboutButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      type="button"
      className={`relative group ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="About Citizens Portal"
      role="button"
      tabIndex={0}
    >
      {/* Main button container with exact styling from design */}
      <div className="w-[160px] sm:w-[180px] md:w-[214px] h-[46px] bg-[#1B1B1D] rounded-[20px] relative overflow-hidden transition-all duration-200 hover:bg-[#252527]"
           style={{
             boxShadow: 'inset 0px -1px 0px rgba(255, 255, 255, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
           }}>
        
        {/* ABOUT text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="font-work font-light text-[16px] sm:text-[17px] md:text-[18px] leading-[100%] text-center text-white">
            ABOUT
          </span>
        </div>
        
        {/* Small rounded border element (expand/collapse indicator) */}
        <div className="absolute right-[6px] sm:right-[8px] md:right-[9px] top-1/2 -translate-y-1/2 w-[32px] sm:w-[36px] md:w-[40px] h-[23px] sm:h-[25px] md:h-[27px] border border-[#BCBCBC] rounded-[19px] flex items-center justify-center transition-all duration-200">
          {/* Vector/arrow indicator */}
          <div 
            className={`w-[6px] h-[1px] bg-[#BCBCBC] transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
            style={{
              clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
            }}
          />
        </div>
      </div>
    </button>
  );
} 
import React, { useState, useEffect, useRef } from 'react';

interface DialProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  color?: string;
}

const Dial: React.FC<DialProps> = ({ label, value, min, max, onChange, color = "#39ff14" }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate angle based on value (mapping min-max to -135deg to +135deg)
  const percent = (value - min) / (max - min);
  const angle = -135 + (percent * 270);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only prevent default if we are interacting with the dial to avoid scrolling issues
    if (e.cancelable) e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !dialRef.current) return;

      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Calculate angle in radians, then degrees
      let theta = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      theta += 90; 
      if (theta < 0) theta += 360;
      
      const deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      let rotation = deg + 90; // Up is 0.
      
      let finalAngle = rotation;
      if (finalAngle > 180) finalAngle -= 360;

      // Clamp
      if (finalAngle < -135) finalAngle = -135;
      if (finalAngle > 135) finalAngle = 135;

      // Map back to value
      const newPercent = (finalAngle + 135) / 270;
      const newValue = min + newPercent * (max - min);
      
      onChange(Math.min(max, Math.max(min, newValue)));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, min, max, onChange]);

  return (
    <div className="flex flex-col items-center gap-3 select-none touch-none w-full">
      <div className="relative flex items-center justify-center">
         
         {/* Ticks Background */}
         <div className="absolute w-32 h-32 rounded-full pointer-events-none">
             {[...Array(21)].map((_, i) => {
                 const tickAngle = -135 + (i * 13.5);
                 const isMain = i % 5 === 0;
                 return (
                   <div 
                     key={i}
                     className={`absolute top-0 left-1/2 origin-bottom ${isMain ? 'h-[55%] w-0.5' : 'h-[52%] w-px opacity-40'}`}
                     style={{ 
                       transform: `translateX(-50%) rotate(${tickAngle}deg)`,
                       background: isMain ? color : '#555'
                     }}
                   >
                     <div className={`w-full ${isMain ? 'h-2' : 'h-1'} bg-current absolute top-0`} />
                   </div>
                 )
             })}
         </div>

         {/* The Knob */}
         <div 
            ref={dialRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-full cursor-grab active:cursor-grabbing z-10 knob-shadow transition-transform active:scale-95"
            style={{ 
                touchAction: 'none',
                background: 'conic-gradient(from 180deg, #333 0%, #111 40%, #000 50%, #111 60%, #333 100%)',
                border: '2px solid #222'
            }}
          >
             {/* Metallic Texture/Ridge */}
             <div className="absolute inset-0 rounded-full opacity-20 bg-[repeating-conic-gradient(#000_0deg_1deg,#333_1deg_2deg)]"></div>
             
             {/* Inner Surface */}
             <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#2a2a2a] to-black border border-[#333] shadow-inner"></div>
             
             {/* Indicator Line */}
             <div 
               className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-75 ease-out"
               style={{ transform: `rotate(${angle}deg)` }}
             >
                {/* Marker Light */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 rounded-full shadow-[0_0_5px_currentColor] bg-current transition-colors" style={{ color: color }}></div>
             </div>
          </div>

      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-[10px] tracking-[0.2em] text-neutral-500 font-bold uppercase mb-1">{label}</div>
        <div className="text-xl font-mono leading-none font-bold" style={{ color: color, textShadow: `0 0 10px ${color}40` }}>
            {value.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default Dial;
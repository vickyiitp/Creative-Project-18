import React, { useMemo } from 'react';

interface DecoderProps {
  message: string;
  quality: number; // 0 to 1
  isLocked: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>/?";

const Decoder: React.FC<DecoderProps> = ({ message, quality, isLocked }) => {
  
  // Create the displayed text based on quality
  const displayedText = useMemo(() => {
    if (isLocked) return message;
    
    return message.split('').map(char => {
      if (char === ' ') return ' ';
      // Probability of showing correct char is roughly equal to quality^2 (non-linear for effect)
      if (Math.random() < Math.pow(quality, 3)) {
        return char;
      }
      // Otherwise random char
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
  }, [message, quality, isLocked, Date.now()]); // Trigger re-render often handled by parent loop? 
  // Actually, useMemo won't update on every frame unless dependencies change.
  // We need this to jitter. Let's make it a functional render inside the component or use a specialized hook.
  
  // Better approach: Just render it. The parent App will re-render this component on frame/state update.
  // But React might batch updates. We'll rely on the parent's `signalQuality` changing to trigger updates.
  // If signalQuality is constant, it looks static. That's fine.
  
  // To make it jitter even when static, we'd need local state or a timer.
  // Let's stick to the prop update for now.

  return (
    <div className="w-full p-6 bg-black border border-green-900/50 rounded mt-4 min-h-[120px] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#39ff14 1px, transparent 1px), linear-gradient(90deg, #39ff14 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="font-vt323 text-3xl md:text-5xl tracking-widest text-center z-10 break-words w-full" 
           style={{ 
             color: isLocked ? '#39ff14' : `rgba(57, 255, 20, ${0.4 + quality * 0.6})`,
             textShadow: isLocked ? '0 0 10px #39ff14' : 'none'
           }}>
        {displayedText}
      </div>
      
      <div className="absolute bottom-2 right-2 text-xs text-green-700 font-mono">
        DECRYPTION_MATRIX: {isLocked ? 'COMPLETE' : `${(quality * 100).toFixed(1)}%`}
      </div>
    </div>
  );
};

export default Decoder;
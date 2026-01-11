import React, { useRef, useEffect } from 'react';
import { WaveParams } from '../types';

interface OscilloscopeProps {
  playerParams: WaveParams;
  targetParams: WaveParams;
  signalQuality: number;
  level: number;
}

const Oscilloscope: React.FC<OscilloscopeProps> = ({ playerParams, targetParams, signalQuality, level }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const requestRef = useRef<number>();

  // Handle Resize for Retina/High DPI
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      
      const rect = container.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.05;
      
      // We need logical width/height (CSS pixels), not physical
      const width = parseFloat(canvas.style.width) || canvas.width;
      const height = parseFloat(canvas.style.height) || canvas.height;
      const centerY = height / 2;

      // Clear with heavy trail effect for phosphorus look
      ctx.fillStyle = 'rgba(5, 10, 5, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(26, 66, 26, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 1. Draw Target Wave (The Signal in the noise)
      if (targetParams.amplitude > 0) {
          ctx.beginPath();
          // Glow effect for target
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(57, 255, 20, ${0.4 + signalQuality * 0.6})`;
          ctx.strokeStyle = `rgba(57, 255, 20, ${0.4 + signalQuality * 0.5})`;
          ctx.lineWidth = 3;
          
          for (let x = 0; x < width; x++) {
            // Target calculation
            const freq = targetParams.frequency / 50;
            const amp = targetParams.amplitude;
            const phase = timeRef.current * 0.5 + targetParams.phaseOffset;
            
            // Add noise to target based on INVERSE signal quality AND Level
            // Higher level = more inherent noise, making it harder to see the clean wave
            const baseNoise = (1 - signalQuality) * 20;
            const levelNoise = (level - 1) * 2; // Extra jitter per level
            const totalNoiseRange = baseNoise + levelNoise;
            
            const noise = (Math.random() - 0.5) * totalNoiseRange;
            
            const y = centerY + Math.sin(x * freq + phase) * amp + noise;
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset shadow
      }

      // 2. Draw Player Wave (The Intercept Tuner)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; 
      ctx.lineWidth = 2;
      // White/Amber glow for player line
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';

      for (let x = 0; x < width; x++) {
        const freq = playerParams.frequency / 50;
        const amp = playerParams.amplitude;
        const phase = timeRef.current * 0.5; 

        const y = centerY + Math.sin(x * freq + phase) * amp;
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. CRT Scanline
      const scanY = (timeRef.current * 80) % height;
      const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 10);
      gradient.addColorStop(0, 'rgba(57, 255, 20, 0)');
      gradient.addColorStop(0.5, 'rgba(57, 255, 20, 0.1)');
      gradient.addColorStop(1, 'rgba(57, 255, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 5, width, 15);

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [playerParams, targetParams, signalQuality, level]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-56 md:h-72 bg-black overflow-hidden"
    >
      <canvas 
        ref={canvasRef} 
        className="block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Oscilloscope;
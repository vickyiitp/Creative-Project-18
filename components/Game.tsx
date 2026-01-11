import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Power, Radio, Volume2, ArrowLeft, RefreshCw, Cpu, Activity, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import Oscilloscope from './Oscilloscope';
import Dial from './Dial';
import Decoder from './Decoder';
import { generateSpyMessage } from '../services/geminiService';
import { WaveParams, SignalStatus } from '../types';

// Audio Context (Singleton to persist across re-renders but manage state carefully)
let audioCtx: AudioContext | null = null;
let carrierOsc: OscillatorNode | null = null;
let carrierGain: GainNode | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;

interface GameProps {
  onBack: () => void;
}

const Game: React.FC<GameProps> = ({ onBack }) => {
  const [powerOn, setPowerOn] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("INITIALIZING...");
  const [signalQuality, setSignalQuality] = useState(0); // 0.0 - 1.0
  const [status, setStatus] = useState<SignalStatus>(SignalStatus.LOST);
  const [isLocked, setIsLocked] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  
  // New State for Timer/Game Over
  const [timeLeft, setTimeLeft] = useState(60); // Seconds
  const [gameOver, setGameOver] = useState(false);

  // Target params (The hidden signal)
  const [targetParams, setTargetParams] = useState<WaveParams>({
    frequency: 10,
    amplitude: 50,
    phaseOffset: 0
  });

  // Player params (The interceptor)
  const [playerParams, setPlayerParams] = useState<WaveParams>({
    frequency: 5,
    amplitude: 20,
    phaseOffset: 0
  });

  // Target drift references
  const targetDriftRef = useRef({ freqDir: 1, ampDir: 1 });
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Initialize Game Level
  const startLevel = useCallback(async (isRestart = false) => {
    setLoadingMessage(true);
    // Reset quality to avoid instant lock on next level
    setSignalQuality(0);
    
    if (isRestart) {
        setLevel(1);
        setScore(0);
        setGameOver(false);
    }

    // Timer decreases as level increases to add pressure
    const baseTime = 60;
    const timePenalty = (isRestart ? 1 : level) * 2; 
    setTimeLeft(Math.max(20, baseTime - timePenalty)); 
    
    try {
      const msg = await generateSpyMessage();
      setMessage(msg);
    } catch (e) {
      console.error("Msg generation failed", e);
      setMessage("ERROR RECEIVING DATA");
    } finally {
      setLoadingMessage(false);
    }
    
    // Randomize Target
    setTargetParams({
      frequency: 5 + Math.random() * 10, // 5 - 15
      amplitude: 30 + Math.random() * 50, // 30 - 80
      phaseOffset: Math.random() * Math.PI * 2
    });
    
    setIsLocked(false);
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(console.error);
    }
  }, [level]);

  const initAudioNodes = () => {
    if (!audioCtx) {
       audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Re-create nodes if they were stopped/garbage collected
    stopAudio();

    // Carrier (High pitched sine)
    carrierOsc = audioCtx.createOscillator();
    carrierOsc.type = 'sine';
    carrierOsc.frequency.value = 440;
    carrierGain = audioCtx.createGain();
    carrierGain.gain.value = 0; // Start silent
    
    carrierOsc.connect(carrierGain);
    carrierGain.connect(audioCtx.destination);
    carrierOsc.start();

    // Noise (Static)
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds of noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.15; // Base noise volume

    noiseNode.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseNode.start();
  };

  const stopAudio = () => {
    try {
      if (carrierOsc) { carrierOsc.stop(); carrierOsc.disconnect(); carrierOsc = null; }
      if (noiseNode) { noiseNode.stop(); noiseNode.disconnect(); noiseNode = null; }
      if (carrierGain) { carrierGain.disconnect(); carrierGain = null; }
      if (noiseGain) { noiseGain.disconnect(); noiseGain = null; }
    } catch (e) {
      // Ignore errors if already stopped
    }
  };

  // Sound FX Helpers
  const playSuccessSound = () => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  };

  const playFailSound = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
  };

  const handlePower = async () => {
    if (!powerOn) {
      // Boot Sequence
      setPowerOn(true);
      setIsBooting(true);
      setTimeout(() => setIsBooting(false), 1500); // 1.5s Boot time

      // Initialize audio on user interaction
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx?.state === 'suspended') {
        await audioCtx.resume();
      }
      
      initAudioNodes();
      startLevel(true); // Treat as fresh start
    } else {
      setPowerOn(false);
      stopAudio();
    }
  };

  // Game Loop
  const updateGame = (timestamp: number) => {
    if (!powerOn || isLocked || gameOver) return;

    // Delta time calculation
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // 0. Update Timer
    if (!isBooting) {
        setTimeLeft(prev => {
            const next = prev - dt;
            if (next <= 0) {
                setGameOver(true);
                playFailSound();
                return 0;
            }
            return next;
        });
    }

    // 1. Drift Target (Scales with Level)
    const driftSpeedBase = 0.01 + (level * 0.005);
    setTargetParams(prev => {
      let newFreq = prev.frequency + (driftSpeedBase * targetDriftRef.current.freqDir);
      let newAmp = prev.amplitude + (driftSpeedBase * 5 * targetDriftRef.current.ampDir);

      if (newFreq > 18 || newFreq < 2) targetDriftRef.current.freqDir *= -1;
      if (newAmp > 90 || newAmp < 20) targetDriftRef.current.ampDir *= -1;

      return {
        ...prev,
        frequency: newFreq,
        amplitude: newAmp
      };
    });

    // 2. Calculate Quality
    const freqDiff = Math.abs(targetParams.frequency - playerParams.frequency);
    const ampDiff = Math.abs(targetParams.amplitude - playerParams.amplitude);
    
    // Harder to lock at higher levels? Maybe keep tolerance same but drift makes it harder.
    const freqScore = Math.max(0, 1 - (freqDiff / 3)); 
    const ampScore = Math.max(0, 1 - (ampDiff / 30)); 
    
    const currentQuality = (freqScore * ampScore); 
    
    setSignalQuality(prev => prev + (currentQuality - prev) * 0.1);

    // 3. Update Audio
    if (audioCtx && carrierOsc && carrierGain && noiseGain) {
      carrierOsc.frequency.setTargetAtTime(100 + playerParams.frequency * 50, audioCtx.currentTime, 0.1);
      carrierGain.gain.setTargetAtTime(currentQuality * 0.2, audioCtx.currentTime, 0.1);
      noiseGain.gain.setTargetAtTime(0.15 * (1 - currentQuality * 0.8), audioCtx.currentTime, 0.1);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopAudio();
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, []);

  // Trigger game loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      updateGame(timestamp);
      requestRef.current = requestAnimationFrame(loop);
    };
    if (powerOn) {
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [powerOn, targetParams, playerParams, isLocked, gameOver, level]); // Depend on level for drift

  // Check Lock Status
  useEffect(() => {
    if (gameOver) {
        setStatus(SignalStatus.LOST);
        return;
    }
    
    if (signalQuality > 0.96 && !isLocked) {
      // Lock acquired
      setIsLocked(true);
      playSuccessSound();
      setStatus(SignalStatus.DECODED);
      setScore(s => s + (100 * level) + Math.floor(timeLeft * 10)); // Score + Time Bonus
      
      // Auto advance
      setTimeout(() => {
        setLevel(l => l + 1);
        startLevel(false);
      }, 4000); 
    } else if (signalQuality > 0.8) {
      setStatus(SignalStatus.LOCKED);
    } else if (signalQuality > 0.4) {
      setStatus(SignalStatus.STRONG);
    } else if (signalQuality > 0.1) {
      setStatus(SignalStatus.WEAK);
    } else {
      setStatus(SignalStatus.LOST);
    }
  }, [signalQuality, isLocked, level, startLevel, gameOver, timeLeft]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-2 md:p-6 font-share-tech-mono overflow-hidden">
      {/* Background Texture - now clear to let holographic bg show through */}
      
      {/* Back Button */}
      <button 
        onClick={() => { stopAudio(); onBack(); }} 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-neutral-400 hover:text-[#39ff14] transition-colors bg-black/80 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:border-[#39ff14]/50 shadow-[0_0_10px_rgba(0,0,0,0.5)] group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs tracking-widest hidden md:inline font-bold">ABORT MISSION</span>
      </button>

      {/* Main Rack Unit - Semi transparent now */}
      <div className="w-full max-w-5xl bg-gradient-to-b from-[#2a2a2a]/90 to-[#111]/95 backdrop-blur-sm rounded-xl p-2 md:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] relative mt-12 md:mt-0 animate-fade-in-up border border-[#333]">
        
        {/* Rack Ears/Handles */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-40 w-4 bg-[#1a1a1a] border-r border-[#333] rounded-l hidden md:block shadow-lg"></div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-40 w-4 bg-[#1a1a1a] border-l border-[#333] rounded-r hidden md:block shadow-lg"></div>

        {/* Inner Device Case */}
        <div className="bg-[#151515]/95 rounded-lg p-4 md:p-8 border-t border-l border-[#222] border-b-2 border-r-2 border-black relative overflow-hidden backdrop-blur-md">
          
           {/* Metallic Grain Texture */}
           <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] pointer-events-none"></div>

            {/* Screw heads */}
            <div className="hidden md:flex absolute top-4 left-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_1px_2px_rgba(0,0,0,0.5)] items-center justify-center border border-[#222]"><div className="w-2 h-0.5 bg-[#111] rotate-45 shadow-[inset_0_0_1px_black]"></div></div>
            <div className="hidden md:flex absolute top-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_1px_2px_rgba(0,0,0,0.5)] items-center justify-center border border-[#222]"><div className="w-2 h-0.5 bg-[#111] rotate-12 shadow-[inset_0_0_1px_black]"></div></div>
            <div className="hidden md:flex absolute bottom-4 left-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_1px_2px_rgba(0,0,0,0.5)] items-center justify-center border border-[#222]"><div className="w-2 h-0.5 bg-[#111] rotate-90 shadow-[inset_0_0_1px_black]"></div></div>
            <div className="hidden md:flex absolute bottom-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#333] to-[#000] shadow-[0_1px_2px_rgba(0,0,0,0.5)] items-center justify-center border border-[#222]"><div className="w-2 h-0.5 bg-[#111] rotate-45 shadow-[inset_0_0_1px_black]"></div></div>

            {/* Header Panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-black/40 p-4 rounded border-t border-b border-white/5 relative">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:4px_4px]"></div>
              
              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black rounded border border-neutral-700 flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                       <Radio className={`w-6 h-6 ${powerOn ? 'text-[#39ff14] animate-pulse' : 'text-neutral-800'}`} />
                    </div>
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-neutral-300 drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
                        SIGNAL INTERCEPT
                      </h1>
                      <div className="text-[10px] text-neutral-500 font-mono tracking-widest flex items-center gap-2">
                        UNIT: MK-IV <span className="w-1 h-1 bg-neutral-600 rounded-full"></span> CLASS: CLASSIFIED
                      </div>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end relative z-10 bg-black/60 px-4 py-2 rounded border border-white/5">
                <div className="text-right">
                    <div className="text-[10px] text-neutral-500 font-bold tracking-wider">SCORE</div>
                    <div className="text-[#39ff14] font-mono text-xl leading-none text-glow">{score.toString().padStart(6, '0')}</div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-right">
                    <div className="text-[10px] text-neutral-500 font-bold tracking-wider">LEVEL</div>
                    <div className="text-amber-500 font-mono text-xl leading-none">{level.toString().padStart(2, '0')}</div>
                </div>
              </div>
            </div>

            {/* Main Interface Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                
                {/* Left Column: Scope */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                     <div className="relative bg-[#050505] rounded-lg border-4 border-[#1a1a1a] shadow-[0_0_0_1px_rgba(255,255,255,0.1),inset_0_0_20px_black] overflow-hidden group">
                        <Oscilloscope 
                            playerParams={playerParams} 
                            targetParams={targetParams} 
                            signalQuality={powerOn && !isBooting && !gameOver ? signalQuality : 0} 
                            level={level}
                        />
                        
                        {/* Overlay States */}
                        {!powerOn && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30">
                                <div className="text-neutral-700 font-mono text-lg tracking-[0.2em] mb-2">SYSTEM OFFLINE</div>
                                <div className="text-[10px] text-neutral-800">WAITING FOR INPUT</div>
                            </div>
                        )}
                        
                        {powerOn && isBooting && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30 animate-pulse">
                                <Cpu className="text-[#39ff14] w-12 h-12 mb-4 animate-spin" />
                                <div className="text-[#39ff14] font-mono text-sm tracking-[0.2em]">BOOT SEQUENCE INITIATED...</div>
                                <div className="w-48 h-1 bg-neutral-800 mt-4 rounded overflow-hidden">
                                    <div className="h-full bg-[#39ff14] animate-[width_1.5s_ease-out_forwards]" style={{width: '0%'}}></div>
                                </div>
                            </div>
                        )}
                        
                        {loadingMessage && powerOn && !isBooting && !gameOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-[2px]">
                                <div className="bg-black/80 border border-[#39ff14]/30 px-6 py-3 rounded flex items-center gap-3 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                                    <RefreshCw className="text-[#39ff14] animate-spin w-4 h-4" />
                                    <span className="text-[#39ff14] font-mono text-xs tracking-widest animate-pulse">ACQUIRING TARGET SIGNAL...</span>
                                </div>
                            </div>
                        )}

                        {gameOver && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 z-30 backdrop-blur-sm animate-fade-in-up">
                                <AlertTriangle className="text-red-500 w-16 h-16 mb-4 animate-pulse" />
                                <h2 className="text-red-500 font-bold text-3xl tracking-widest bg-black/80 px-4 py-2 border border-red-500/50 rounded mb-2">SIGNAL LOST</h2>
                                <p className="text-white font-mono mb-6 text-sm">TRANSMISSION TERMINATED</p>
                                <div className="text-center mb-6">
                                    <div className="text-[10px] text-neutral-400">FINAL SCORE</div>
                                    <div className="text-2xl text-white font-bold tracking-wider">{score}</div>
                                </div>
                                <button 
                                    onClick={() => startLevel(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-black font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105"
                                >
                                    <RotateCcw size={18} />
                                    RE-ESTABLISH CONNECTION
                                </button>
                            </div>
                        )}

                        {/* Screen Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-40 rounded-lg"></div>
                     </div>

                     {/* Decoder Unit */}
                     <div className="bg-[#111] border border-[#222] rounded p-1 relative">
                        <div className="absolute top-0 left-2 text-[8px] text-neutral-600 bg-[#111] px-1 -translate-y-1/2 uppercase tracking-wider font-bold">Message Decoder Matrix</div>
                        <Decoder message={message} quality={signalQuality} isLocked={isLocked} />
                     </div>
                </div>

                {/* Right Column: Controls */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Status Monitor */}
                    <div className="bg-[#0f0f0f] rounded border border-white/5 p-4 relative shadow-inner">
                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                             <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Signal Analysis</span>
                             <Activity className={`w-4 h-4 ${status === SignalStatus.LOCKED || status === SignalStatus.DECODED ? 'text-[#39ff14]' : 'text-neutral-700'}`} />
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-neutral-400">STATUS:</span>
                            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                status === SignalStatus.DECODED ? 'bg-[#39ff14] text-black animate-pulse' : 
                                status === SignalStatus.LOST ? 'bg-red-900/30 text-red-500' : 'text-[#39ff14]'
                            }`}>
                                {status}
                            </span>
                        </div>

                        {/* Timer Bar */}
                        <div className="space-y-1 mt-4">
                            <div className="flex justify-between text-[10px] text-neutral-600 font-mono">
                                <span>TRANSMISSION WINDOW</span>
                                <span className={timeLeft < 10 ? "text-red-500 animate-pulse" : "text-neutral-400"}>{timeLeft.toFixed(1)}s</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#050505] rounded-full overflow-hidden border border-[#222]">
                                <div 
                                    className={`h-full transition-all duration-100 linear ${timeLeft < 10 ? 'bg-red-600' : 'bg-[#39ff14]'}`}
                                    style={{ width: `${Math.min(100, (timeLeft / (60 - (level > 1 ? (level * 2) : 0))) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Signal Strength Meter */}
                        <div className="space-y-1 mt-4">
                            <div className="flex justify-between text-[10px] text-neutral-600 font-mono">
                                <span>SIGNAL INTEGRITY</span>
                                <span>{(signalQuality * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-3 bg-[#050505] rounded-sm border border-[#222] p-[1px]">
                                <div className="w-full h-full flex gap-[1px]">
                                    {[...Array(20)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex-1 rounded-[1px] transition-colors duration-100 ${
                                                (i / 20) < signalQuality 
                                                ? (i > 16 ? 'bg-red-500' : i > 12 ? 'bg-amber-400' : 'bg-[#39ff14]') 
                                                : 'bg-[#1a1a1a]'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dials Control Panel */}
                    <div className="flex-1 bg-[#1a1a1a] rounded-lg p-6 border-t border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-8 relative">
                         {/* Panel Texture */}
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
                         
                         {/* Screws */}
                         <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#111] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                         <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#111] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                         <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#111] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                         <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#111] shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>

                         <div className="relative z-10 w-full flex flex-col items-center gap-8">
                             <div className="w-full flex justify-between px-4">
                                <Dial 
                                    label="FREQUENCY" 
                                    value={playerParams.frequency} 
                                    min={1} 
                                    max={20} 
                                    onChange={(v) => setPlayerParams(prev => ({ ...prev, frequency: v }))}
                                />
                             </div>
                             
                             <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                             <div className="w-full flex justify-between px-4">
                                <Dial 
                                    label="AMPLITUDE" 
                                    value={playerParams.amplitude} 
                                    min={10} 
                                    max={100} 
                                    onChange={(v) => setPlayerParams(prev => ({ ...prev, amplitude: v }))}
                                    color="#f59e0b"
                                />
                             </div>
                         </div>
                    </div>

                    {/* Power Switch */}
                    <div className="flex justify-center mt-2">
                        <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={handlePower}
                                aria-label="Toggle Power"
                                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_-2px_5px_rgba(0,0,0,0.5)] active:scale-95 group ${
                                    powerOn ? 'bg-gradient-to-b from-[#1a1a1a] to-black border-2 border-[#39ff14]' : 'bg-gradient-to-b from-[#1a1a1a] to-black border-2 border-red-900'
                                }`}
                            >
                                {/* Glow Ring */}
                                <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 ${powerOn ? 'bg-[#39ff14]/20 opacity-100' : 'bg-red-500/10 opacity-50'}`}></div>
                                
                                <Power className={`w-8 h-8 transition-colors duration-300 relative z-10 ${powerOn ? 'text-[#39ff14] drop-shadow-[0_0_8px_#39ff14]' : 'text-red-900 group-hover:text-red-700'}`} />
                            </button>
                            <div className="text-[10px] text-neutral-500 font-bold tracking-[0.2em] uppercase">Main Power</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 flex justify-between items-center text-[10px] text-neutral-600 font-mono border-t border-white/5 pt-2">
                <div className="flex gap-4">
                    <span>SYS_ID: 884-ALPHA</span>
                    <span>LOC: OUTPOST-44</span>
                </div>
                <div className="flex gap-2 items-center">
                    <Volume2 className="w-3 h-3 opacity-50" />
                    <span className="hidden md:inline">AUDIO MONITORING ACTIVE</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
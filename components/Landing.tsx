import React, { useState, useEffect } from 'react';
import { Radio, Menu, X, Github, Twitter, Play, Database, Globe, Zap, Target, ArrowUp } from 'lucide-react';
import Modal from './Modal';

interface LandingProps {
  onPlay: () => void;
}

const Landing: React.FC<LandingProps> = ({ onPlay }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'privacy' | 'terms' | 'instructions'>('instructions');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (type: 'privacy' | 'terms' | 'instructions') => {
    setModalContent(type);
    setModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative selection:bg-[#39ff14] selection:text-black font-inter">
      
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent === 'instructions' ? 'MISSION PROTOCOLS' : modalContent === 'terms' ? 'SECURITY CLEARANCE' : 'PRIVACY ENCRYPTION'}
      >
        {modalContent === 'instructions' && (
          <div className="space-y-4">
             <p className="font-mono text-sm text-neutral-300"><span className="text-[#39ff14]">OBJECTIVE:</span> INTERCEPT ENCRYPTED RADIO TRANSMISSIONS.</p>
             <p className="font-mono text-sm text-neutral-300"><span className="text-[#39ff14]">METHOD:</span> ADJUST FREQUENCY AND AMPLITUDE DIALS TO MATCH THE TARGET WAVEFORM HIDDEN IN THE STATIC.</p>
             <div className="p-4 border border-white/10 bg-black/50 rounded">
                <ul className="list-disc list-inside space-y-2 text-xs font-mono text-neutral-400">
                    <li>ALIGN THE WHITE WAVE WITH THE GREEN TARGET WAVE.</li>
                    <li>MAINTAIN LOCK TO DECRYPT THE MESSAGE.</li>
                    <li>WATCH THE TIMER - SIGNAL WINDOW IS LIMITED.</li>
                    <li>HIGHER LEVELS INTRODUCE SIGNAL DRIFT AND INTERFERENCE.</li>
                </ul>
             </div>
          </div>
        )}
        {modalContent === 'terms' && (
          <div className="space-y-4 text-xs font-mono text-neutral-400">
            <p>BY ACCESSING THIS TERMINAL, YOU AGREE TO CLASSIFIED INFORMATION HANDLING PROTOCOLS.</p>
            <p>UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE PUNISHABLE BY PERMANENT OFFLINE STATUS.</p>
            <p>THE AGENCY IS NOT RESPONSIBLE FOR PSYCHOLOGICAL DAMAGE CAUSED BY INTERCEPTED PROPAGANDA.</p>
          </div>
        )}
        {modalContent === 'privacy' && (
           <div className="space-y-4 text-xs font-mono text-neutral-400">
             <p>NO PERSONAL DATA IS TRANSMITTED TO EXTERNAL SERVERS.</p>
             <p>ALL DECRYPTION HAPPENS LOCALLY IN YOUR BROWSER KERNEL.</p>
             <p>WE ARE WATCHING, BUT WE ARE NOT RECORDING... YET.</p>
           </div>
        )}
      </Modal>

      {/* Hero Background Elements - Orbiting Satellites */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Orbital Ring 1 */}
         <div className="absolute top-1/2 left-1/2 w-[120vh] h-[120vh] border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-[spin_60s_linear_infinite]">
             <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full blur-[2px] -translate-x-1/2 -translate-y-1.5"></div>
         </div>
         {/* Orbital Ring 2 */}
         <div className="absolute top-1/2 left-1/2 w-[80vh] h-[80vh] border border-dashed border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-[spinReverse_45s_linear_infinite]">
             <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#39ff14] rounded-full blur-[1px] -translate-x-1/2 translate-y-1"></div>
         </div>
         
         {/* Floating Satellites Icons */}
         <div className="absolute top-[20%] right-[15%] opacity-40 float-object delay-100">
             <Target className="text-red-500 w-8 h-8 opacity-80" />
             <div className="text-[8px] font-mono text-red-500 mt-1">SAT-44 LOCKED</div>
         </div>
         <div className="absolute bottom-[25%] left-[10%] opacity-30 float-object delay-300">
             <Zap className="text-amber-400 w-6 h-6" />
             <div className="text-[8px] font-mono text-amber-400 mt-1">POWER SURGE</div>
         </div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-[#050b14]/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
                <div className="relative">
                    <Radio className="text-[#39ff14] group-hover:rotate-12 transition-transform duration-500" size={24} />
                    <div className="absolute -inset-2 bg-[#39ff14]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold tracking-[0.2em] text-lg font-mono text-white leading-none">SIGNAL</span>
                    <span className="text-[10px] tracking-[0.4em] text-[#39ff14] font-mono leading-none group-hover:text-glow">INTERCEPT</span>
                </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 text-xs font-mono tracking-widest text-neutral-400 items-center">
                <button onClick={() => openModal('instructions')} className="hover:text-[#39ff14] cursor-pointer transition-colors uppercase hover:scale-105 transform duration-200">Protocols</button>
                <button onClick={() => openModal('terms')} className="hover:text-[#39ff14] cursor-pointer transition-colors uppercase hover:scale-105 transform duration-200">Clearance</button>
                <div className="h-4 w-px bg-white/10"></div>
                <a href="https://github.com/vickyiitp" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Github size={16}/></a>
                <a href="https://x.com/vickyiitp" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Twitter size={16}/></a>
                
                <button onClick={onPlay} className="flex items-center gap-2 bg-[#39ff14] text-black px-5 py-2 rounded font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]">
                    <Play size={12} fill="currentColor" />
                    PLAY NOW
                </button>
            </div>

            {/* Mobile Hamburger */}
            <button 
            className="md:hidden text-white hover:text-[#39ff14] transition-colors p-2" 
            aria-label="Toggle Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#000508]/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 md:hidden animate-fade-in-up border-l border-white/10">
           <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white p-2">
             <X size={32} />
           </button>
           <button onClick={() => openModal('instructions')} className="text-xl font-mono hover:text-[#39ff14] cursor-pointer tracking-widest border-b border-transparent hover:border-[#39ff14] pb-1 transition-all">PROTOCOLS</button>
           <button onClick={() => openModal('terms')} className="text-xl font-mono hover:text-[#39ff14] cursor-pointer tracking-widest border-b border-transparent hover:border-[#39ff14] pb-1 transition-all">CLEARANCE</button>
           <a href="mailto:themvaplatform@gmail.com" className="text-xl font-mono hover:text-[#39ff14] cursor-pointer tracking-widest border-b border-transparent hover:border-[#39ff14] pb-1 transition-all">CONTACT</a>
           <button onClick={() => { setIsMenuOpen(false); onPlay(); }} className="px-10 py-4 bg-[#39ff14] text-black font-bold tracking-widest rounded hover:bg-white transition-colors shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center gap-3">
             <Play size={20} fill="currentColor" />
             START MISSION
           </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-32 md:pt-48 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 border border-[#39ff14]/30 rounded-full bg-[#39ff14]/5 backdrop-blur-sm animate-fade-in-up hover:bg-[#39ff14]/10 transition-colors cursor-default group shadow-[0_0_15px_rgba(57,255,20,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39ff14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39ff14]"></span>
            </span>
            <span className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-[#39ff14] uppercase group-hover:text-white transition-colors">
              Live Intercept Active
            </span>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.85] animate-fade-in-up delay-100 uppercase select-none relative z-10 drop-shadow-2xl">
          THE FREQUENCY <br/>
          <span className="glitch-text text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] via-emerald-300 to-teal-400" data-text="IS WAR">IS WAR</span>
        </h1>
        
        <p className="max-w-2xl text-blue-200/70 text-base md:text-xl font-mono leading-relaxed mb-12 animate-fade-in-up delay-200 px-4">
          Tune into the shadows. Decrypt the signals.
          <br className="hidden md:block"/>
          <span className="text-white drop-shadow">The fate of the free world hangs on your receiver.</span>
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in-up delay-300 relative z-10">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#39ff14] to-emerald-600 rounded blur opacity-30 group-hover:opacity-80 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                <button 
                    onClick={onPlay}
                    className="relative px-12 py-5 bg-[#050b14] border border-[#39ff14] rounded text-[#39ff14] font-bold tracking-[0.2em] text-lg hover:bg-[#39ff14] hover:text-black transition-all duration-300 flex items-center gap-4 overflow-hidden shadow-2xl"
                >
                    <Radio className="w-5 h-5" />
                    ESTABLISH LINK
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]"></div>
                </button>
            </div>
            
            <button 
                onClick={() => openModal('instructions')}
                className="px-12 py-5 bg-transparent border border-white/20 rounded text-neutral-300 font-bold tracking-[0.2em] text-lg hover:bg-white/5 hover:text-white hover:border-white/50 transition-all duration-300 flex items-center gap-4 backdrop-blur-sm"
            >
                BRIEFING
            </button>
        </div>

        {/* Hero Decorative Data Stream */}
        <div className="absolute left-4 top-1/3 hidden lg:flex flex-col gap-2 text-[10px] font-mono text-[#39ff14]/30 select-none pointer-events-none">
            <div className="animate-pulse">AES-256 ... DETECTED</div>
            <div>PACKET LOSS ... 0.02%</div>
            <div>ORIGIN ... UNKNOWN</div>
            <div>TARGET ... LOCKED</div>
        </div>
        <div className="absolute right-4 bottom-1/3 hidden lg:flex flex-col gap-2 text-[10px] font-mono text-right text-[#39ff14]/30 select-none pointer-events-none">
            <div>34.552, -118.243</div>
            <div className="animate-pulse">UPLINK ... STABLE</div>
            <div>ENCRYPTION ... ROT-13</div>
        </div>
      </section>

      {/* Stats/Info Banner */}
      <section className="border-y border-white/5 bg-[#050b14]/60 backdrop-blur-md py-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex flex-col items-center md:items-start group hover:translate-y-[-2px] transition-transform">
                <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2 group-hover:text-[#39ff14] transition-colors">
                    <Database size={18} className="text-[#39ff14]"/> 1.2M+
                </div>
                <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Signals Intercepted</div>
             </div>
             <div className="flex flex-col items-center md:items-start group hover:translate-y-[-2px] transition-transform">
                <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                    <Globe size={18} className="text-blue-400"/> GLOBAL
                </div>
                <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Coverage Area</div>
             </div>
             <div className="flex flex-col items-center md:items-start group hover:translate-y-[-2px] transition-transform">
                <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2 group-hover:text-purple-400 transition-colors">
                    <Zap size={18} className="text-purple-400"/> 99.9%
                </div>
                <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Uptime Reliability</div>
             </div>
             <div className="flex flex-col items-center md:items-start group hover:translate-y-[-2px] transition-transform">
                <div className="text-2xl font-bold text-white mb-1 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                    <Target size={18} className="text-red-400"/> 42
                </div>
                <div className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Active Threats</div>
             </div>
          </div>
      </section>

      {/* Features / How it works */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-mono tracking-tighter">
            <span className="text-[#39ff14]">///</span> SYSTEM ARCHITECTURE
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-card p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Radio size={100} />
                </div>
                <div className="w-12 h-12 bg-[#39ff14]/10 rounded flex items-center justify-center mb-6 text-[#39ff14] group-hover:scale-110 transition-transform">
                    <Radio size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono tracking-wide">SIGNAL SCANNING</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    Advanced Fourier Transform algorithms scan the spectrum for encrypted anomalies hidden in background noise.
                </p>
                <div className="mt-6 h-1 w-full bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-[#39ff14] w-1/3 group-hover:w-full transition-all duration-1000"></div>
                </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Database size={100} />
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                    <Database size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono tracking-wide">PATTERN MATCHING</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    Align your oscillator to the target frequency. Precision is key. Signal drift increases with interception depth.
                </p>
                <div className="mt-6 h-1 w-full bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-blue-400 w-1/3 group-hover:w-full transition-all duration-1000 delay-100"></div>
                </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Target size={100} />
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
                    <Target size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono tracking-wide">DECRYPTION</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                    Once locked, the Gemini AI neural engine decodes the transmission in real-time. Secure the intel.
                </p>
                <div className="mt-6 h-1 w-full bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-red-500 w-1/3 group-hover:w-full transition-all duration-1000 delay-200"></div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050b14]/90 backdrop-blur-lg pt-16 pb-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                <div className="mb-8 md:mb-0 text-center md:text-left">
                    <div className="font-bold text-2xl tracking-widest text-white mb-2">SIGNAL INTERCEPT</div>
                    <div className="text-xs text-neutral-500 font-mono">EST. 2025 // CLASSIFIED OPERATIONS</div>
                </div>
                <div className="flex gap-6">
                    <a href="https://youtube.com/@vickyiitp" className="text-neutral-400 hover:text-red-500 transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Play size={20} /></a>
                    <a href="https://linkedin.com/in/vickyiitp" className="text-neutral-400 hover:text-blue-500 transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Database size={20} /></a>
                    <a href="https://x.com/vickyiitp" className="text-neutral-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Twitter size={20} /></a>
                    <a href="https://github.com/vickyiitp" className="text-neutral-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Github size={20} /></a>
                </div>
            </div>
            
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-neutral-500">
                <div>&copy; 2025 VICKYIITP. ALL RIGHTS RESERVED.</div>
                <div className="flex gap-6">
                    <button onClick={() => openModal('privacy')} className="hover:text-[#39ff14] transition-colors uppercase">Privacy Protocol</button>
                    <button onClick={() => openModal('terms')} className="hover:text-[#39ff14] transition-colors uppercase">Terms of Engagement</button>
                </div>
            </div>
        </div>
      </footer>
      
      {/* Floating Back to Top */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 bg-[#39ff14] text-black rounded-full shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300 hover:scale-110 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ArrowUp size={20} strokeWidth={3} />
      </button>

    </div>
  );
};

export default Landing;
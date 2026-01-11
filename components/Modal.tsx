import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#111] border border-[#39ff14]/30 text-neutral-300 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-mono font-bold text-[#39ff14] tracking-widest uppercase">{title}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto font-sans leading-relaxed space-y-4">
          {children}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono border border-white/20 hover:border-[#39ff14] hover:text-[#39ff14] transition-colors rounded"
          >
            CLOSE_FILE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-[#39ff14] font-mono flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert size={64} className="mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold mb-4 tracking-widest">SYSTEM FAILURE</h1>
          <p className="text-neutral-400 max-w-md mb-8">
            CRITICAL ERROR INTERCEPTED. THE CONNECTION HAS BEEN TERMINATED TO PROTECT INTEL.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-[#39ff14] hover:bg-[#39ff14] hover:text-black transition-colors font-bold tracking-widest"
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
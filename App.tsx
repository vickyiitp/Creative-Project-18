import React, { useState, Suspense, lazy } from 'react';
import Landing from './components/Landing';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load Game component to improve initial load performance
const Game = lazy(() => import('./components/Game'));

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'game'>('landing');

  return (
    <ErrorBoundary>
      <div className="crt-overlay fixed inset-0 pointer-events-none z-[100]" />
      
      {view === 'landing' ? (
        <Landing onPlay={() => setView('game')} />
      ) : (
        <Suspense fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-[#39ff14] font-mono animate-pulse tracking-widest">
              INITIALIZING SECURE CONNECTION...
            </div>
          </div>
        }>
          <Game onBack={() => setView('landing')} />
        </Suspense>
      )}
    </ErrorBoundary>
  );
};

export default App;
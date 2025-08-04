import React from 'react';
import SwapForm from './components/SwapForm';
import AppLogo from './components/AppLogo';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md mx-auto relative z-10 space-y-8 overflow-x-hidden">
        {/* App Logo & Header */}
        <div className="text-center animate-fade-in">
          <AppLogo size="lg" className="mb-4" />
          <p className="text-lg text-gray-300 font-medium px-2">
            Exchange tokens seamlessly with real-time pricing
          </p>
        </div>
        
        {/* Main Swap Form */}
        <div className="animate-fade-in-up w-full">
          <SwapForm />
        </div>
        
        {/* Footer */}
        <div className="text-center animate-fade-in px-2">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-2 flex-wrap">
            <span>Powered by</span>
            <span className="font-semibold text-indigo-400">Switcheo</span>
            <span>•</span>
            <span>Real-time prices</span>
            <span>•</span>
            <span>Secure transactions</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;

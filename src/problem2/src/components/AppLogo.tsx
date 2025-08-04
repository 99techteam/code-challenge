import React from 'react';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-xl', container: 'space-x-2' },
    md: { icon: 'w-12 h-12', text: 'text-3xl', container: 'space-x-3' },
    lg: { icon: 'w-16 h-16', text: 'text-4xl', container: 'space-x-4' }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${sizes.container} ${className}`}>
      {/* Logo Icon - Modern Swap Symbol */}
      <div className={`${sizes.icon} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-xl shadow-lg">
          <div className="absolute inset-0.5 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
            <svg 
              className="w-3/4 h-3/4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
              />
            </svg>
          </div>
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-xl blur-sm opacity-30 -z-10 scale-110"></div>
      </div>
      
      {/* App Name */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${sizes.text} font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight`}>
            SwapX
          </h1>
          <p className="text-sm text-gray-400 -mt-1 font-medium">
            Instant Token Swapping
          </p>
        </div>
      )}
    </div>
  );
};

export default AppLogo;

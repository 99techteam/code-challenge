import { useState } from 'react';

interface CurrencyIconProps {
  src: string;
  alt: string;
  className?: string;
}

const CurrencyIcon = ({ src, alt, className = 'w-6 h-6' }: CurrencyIconProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`${className} rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xs`}>
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

export default CurrencyIcon;
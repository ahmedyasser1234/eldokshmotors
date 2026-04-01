import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  isWhite?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", isWhite = false }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="ELDOKSH Logo" 
        className={`h-full w-auto object-contain transition-all duration-300 ${isWhite ? 'brightness-0 invert' : ''}`}
      />
    </div>
  );
};

export default Logo;

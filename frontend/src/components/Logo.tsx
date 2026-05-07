import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  isWhite?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", isWhite = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tighter text-xl sm:text-2xl ${isWhite ? 'text-white' : 'text-brand-primary'}`}>
          COBRA<span className="text-brand-accent">MOTORS</span>
        </span>
        <span className={`text-[8px] font-bold tracking-[0.3em] uppercase ${isWhite ? 'text-white/60' : 'text-slate-400'}`}>
          Luxury Car Group
        </span>
      </div>
    </div>
  );
};

export default Logo;

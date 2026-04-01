import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); // 3 seconds splash
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
                >
                    <div className="relative w-full flex items-center overflow-hidden">
                        <motion.div 
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="flex whitespace-nowrap items-center"
                        >
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex items-center gap-12 md:gap-24 mx-12 md:mx-24 shrink-0">
                                    <span className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase text-brand-primary">
                                        ELDOKSH
                                    </span>
                                    <img 
                                        src="/logo.png" 
                                        alt="Logo" 
                                        className="h-24 md:h-32 object-contain"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 2.8, ease: "easeInOut" }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent origin-left"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;

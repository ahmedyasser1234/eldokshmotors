import React from 'react';
import { motion } from 'framer-motion';

const Preloader: React.FC = () => {
    return (
        <div className="w-full bg-white flex flex-col items-center justify-center overflow-hidden py-10">
            <div className="relative w-full flex items-center overflow-hidden">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="flex whitespace-nowrap items-center"
                >
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-8 md:gap-12 mx-8 md:mx-12 shrink-0">
                            <span 
                                style={{ fontSize: '3rem' }} 
                                className="font-black tracking-tighter uppercase text-brand-primary"
                            >
                                COBRAMOTORS
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
            
            <div className="w-full h-1 bg-brand-accent mt-4" />
        </div>
    );
};

export default Preloader;

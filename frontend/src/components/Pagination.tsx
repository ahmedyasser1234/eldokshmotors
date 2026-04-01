import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-xs md:text-sm transition-all duration-300 flex items-center justify-center ${
            currentPage === i
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
              : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 shadow-sm'
          }`}
        >
          {i}
        </motion.button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 mt-12 md:mt-16">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`p-3 md:p-4 rounded-xl border transition-all duration-300 ${
          currentPage === 1
            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            : 'bg-white border-slate-100 text-slate-600 hover:border-brand-primary hover:text-brand-primary shadow-sm active:shadow-inner'
        }`}
      >
        <ChevronLeft size={20} className="rtl:rotate-180" />
      </motion.button>

      <div className="flex items-center gap-2 md:gap-3">
        {renderPageNumbers()}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`p-3 md:p-4 rounded-xl border transition-all duration-300 ${
          currentPage === totalPages
            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            : 'bg-white border-slate-100 text-slate-600 hover:border-brand-primary hover:text-brand-primary shadow-sm active:shadow-inner'
        }`}
      >
        <ChevronRight size={20} className="rtl:rotate-180" />
      </motion.button>
    </div>
  );
};

export default Pagination;

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Props = {
  isOpen: boolean;
  hasContent: boolean;
  children: React.ReactNode;
};

export function AppointmentsSidePanel({ isOpen, hasContent, children }: Props) {
  return (
    <AnimatePresence>
      {isOpen && hasContent && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed inset-y-0 right-0 w-full lg:w-[500px] bg-white dark:bg-slate-900 shadow-2xl border-l border-border z-50 overflow-y-auto"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

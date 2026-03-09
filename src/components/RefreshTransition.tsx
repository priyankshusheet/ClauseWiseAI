import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import clausewiseLogo from '@/assets/clausewise-logo.png';

interface RefreshTransitionProps {
  onComplete: () => void;
}

const RefreshTransition: React.FC<RefreshTransitionProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img src={clausewiseLogo} alt="ClauseWise" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div 
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RefreshTransition;

import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  // Animation variants for the spinning circle
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg">
        {/* Spinning Loader */}
        <motion.div
          className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-primary rounded-full"
          variants={spinnerVariants}
          animate="animate"
        />

        {/* Loading Message */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we fetch your content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
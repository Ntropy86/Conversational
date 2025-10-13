'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './Icons';

const DockBottomSheet = ({ isOpen, onClose, dockItems, onItemClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[70vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300 
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              // Close if dragged down more than 100px
              if (info.offset.y > 100) {
                onClose();
              }
            }}
          >
            {/* Sheet Container */}
            <div 
              className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
              style={{
                background: 'rgba(30, 17, 8, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Navigation
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Icon Grid */}
              <div className="px-4 py-6 grid grid-cols-2 gap-4">
                {dockItems.map((item, index) => (
                  <motion.button
                    key={index}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95"
                    style={{
                      backgroundColor: `${item.color}15`,
                      border: `2px solid ${item.color}30`,
                    }}
                    onClick={() => {
                      onItemClick(item);
                      onClose();
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    {/* Icon Circle */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 4px 12px ${item.color}40`,
                      }}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Label */}
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                      {item.tooltip}
                    </span>

                    {/* Active Indicator */}
                    {item.isActive && (
                      <motion.div
                        className="mt-1 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Bottom Safe Area Padding */}
              <div className="h-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DockBottomSheet;

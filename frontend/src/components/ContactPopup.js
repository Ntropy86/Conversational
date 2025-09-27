import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from './Link';

const ContactPopup = ({ isOpen, onClose }) => {
  const contactInfo = {
    email: 'nitigya@neat.software',
    phone: '+1 (555) 123-4567', // You can update this with actual phone
    calendly: 'https://calendly.com/nitigya' // You can update with actual Calendly link
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[201]"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400 text-xl leading-none">×</span>
              </button>

              {/* Content */}
              <div className="pr-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Let&apos;s Set Up a Consultation!
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  I&apos;d be happy to help you with custom code development. Here&apos;s how you can reach me:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                    <Link 
                      href={`mailto:${contactInfo.email}`}
                      external
                      className="text-blue-600 dark:text-blue-400"
                    >
                      {contactInfo.email}
                    </Link>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
                    <Link 
                      href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                      external
                      className="text-blue-600 dark:text-blue-400"
                    >
                      {contactInfo.phone}
                    </Link>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Schedule a Call</h3>
                    <Link 
                      href={contactInfo.calendly}
                      external
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book on Calendly
                    </Link>
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                  Looking forward to discussing your project!
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactPopup;
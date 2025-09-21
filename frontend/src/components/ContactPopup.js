import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>

              {/* Content */}
              <div className="pr-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Let's Set Up a Consultation!
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  I'd be happy to help you with custom code development. Here's how you can reach me:
                </p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {contactInfo.email}
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
                    <a 
                      href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Schedule a Call</h3>
                    <a 
                      href={contactInfo.calendly}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Book on Calendly
                    </a>
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
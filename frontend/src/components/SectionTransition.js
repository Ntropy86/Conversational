'use client';
import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

const SectionTransition = ({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.5,
  type = 'slide-up', // slide-up, fade-in, slide-left, slide-right
  ...props 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();
  
  // Define animation variants
  const variants = {
    hidden: {
      opacity: 0,
      y: type === 'slide-up' ? 20 : 0,
      x: type === 'slide-left' ? 20 : (type === 'slide-right' ? -20 : 0)
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }
    }
  };
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default SectionTransition;
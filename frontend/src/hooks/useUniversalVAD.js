// src/hooks/useUniversalVAD.js - Universal VAD with Safari fallback
import { useState, useEffect } from 'react';
import useVAD from './useVAD';
import useSafariVAD from './useSafariVAD';

const useUniversalVAD = (options = {}) => {
  const [browserType, setBrowserType] = useState(null);
  
  // Detect browser type
  useEffect(() => {
    const detectBrowser = () => {
      const ua = navigator.userAgent.toLowerCase();
      
      if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) {
        setBrowserType('safari');
        console.log('🧭 Detected Safari - using Safari-compatible VAD');
      } else if (ua.indexOf('firefox') !== -1) {
        setBrowserType('firefox');
        console.log('🦊 Detected Firefox - using standard VAD');
      } else if (ua.indexOf('chrome') !== -1 || ua.indexOf('chromium') !== -1) {
        setBrowserType('chrome');
        console.log('🔍 Detected Chrome/Chromium - using standard VAD');
      } else {
        setBrowserType('other');
        console.log('❓ Unknown browser - trying standard VAD first');
      }
    };
    
    detectBrowser();
  }, []);
  
  // Choose VAD implementation based on browser
  const shouldUseSafari = browserType === 'safari';
  const standardVAD = useVAD(shouldUseSafari ? {} : options); // Don't initialize if we'll use Safari
  const safariVAD = useSafariVAD(shouldUseSafari ? options : {});
  
  // Return appropriate VAD based on browser and loading state
  if (browserType === 'safari') {
    return {
      ...safariVAD,
      browserType: 'safari',
      vadType: 'safari-compatible'
    };
  }
  
  // For other browsers, check if standard VAD failed to load
  if (browserType && standardVAD.error && !standardVAD.isLoaded) {
    console.log('⚠️ Standard VAD failed, falling back to Safari VAD');
    return {
      ...safariVAD,
      browserType,
      vadType: 'safari-fallback',
      fallbackReason: standardVAD.error
    };
  }
  
  // Don't return anything until browser is detected
  if (!browserType) {
    return {
      isLoaded: false,
      isLoading: true,
      isListening: false,
      isSpeaking: false,
      error: null,
      toggle: () => false,
      browserType: null,
      vadType: 'detecting'
    };
  }
  
  return {
    ...standardVAD,
    browserType,
    vadType: 'standard'
  };
};

export default useUniversalVAD;
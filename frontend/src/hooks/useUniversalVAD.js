// src/hooks/useUniversalVAD.js - Universal VAD with Safari fallback
import { useState, useEffect } from 'react';
import useVAD from './useVAD';
import useSafariVAD from './useSafariVAD';
import { isSafari, getBrowserInfo } from '../utils/browserDetection';

const useUniversalVAD = (options = {}) => {
  const [browserType, setBrowserType] = useState(null);
  
  // Detect browser type using proper browser detection
  useEffect(() => {
    const detectBrowser = () => {
      const { browser, isSafari: safariDetected } = getBrowserInfo();
      
      if (safariDetected) {
        setBrowserType('safari');
        console.log('🧭 Detected Safari - using Safari-compatible VAD');
      } else if (browser === 'Firefox') {
        setBrowserType('firefox');
        console.log('🦊 Detected Firefox - using standard VAD');
      } else if (browser === 'Chrome') {
        setBrowserType('chrome');
        console.log('🔍 Detected Chrome - using standard VAD');
      } else if (browser === 'Edge') {
        setBrowserType('edge');
        console.log('� Detected Edge - using standard VAD');
      } else {
        setBrowserType('other');
        console.log(`❓ Detected ${browser} - trying standard VAD first`);
      }
    };
    
    detectBrowser();
  }, []);
  
  // Initialize both VADs - Safari VAD always gets options, standard VAD disabled for Safari
  const standardVAD = useVAD(browserType === 'safari' ? { disabled: true } : options);
  const safariVAD = useSafariVAD(browserType !== 'safari' ? { disabled: true } : options);
  
  // Return appropriate VAD based on browser and loading state
  if (browserType === 'safari') {
    console.log('🧭 Using Safari VAD implementation');
    return {
      ...safariVAD,
      browserType: 'safari',
      vadType: 'safari-compatible'
    };
  }
  
  // For other browsers, check if standard VAD failed to load
  if (browserType && standardVAD.error && !standardVAD.isLoaded) {
    console.log('⚠️ Standard VAD failed, falling back to Safari-compatible VAD');
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
  
  // Only log once when VAD is first loaded (not on every render)
  if (standardVAD.isLoaded && !standardVAD.error) {
    console.log(`🔧 Using standard VAD for ${browserType}`);
  }
  
  return {
    ...standardVAD,
    browserType,
    vadType: 'standard'
  };
};

export default useUniversalVAD;
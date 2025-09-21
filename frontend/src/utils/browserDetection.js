/**
 * Browser detection utilities
 */

export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const vendor = window.navigator.vendor;
  
  // Check for Safari-specific patterns
  const isSafariUA = /Safari/.test(userAgent) && /Apple Computer/.test(vendor);
  const isNotChrome = !/Chrome/.test(userAgent);
  const isNotFirefox = !/Firefox/.test(userAgent);
  const isNotEdge = !/Edg/.test(userAgent);
  
  return isSafariUA && isNotChrome && isNotFirefox && isNotEdge;
};

export const getBrowserInfo = () => {
  if (typeof window === 'undefined') {
    return { browser: 'unknown', version: 'unknown', isSafari: false };
  }
  
  const userAgent = window.navigator.userAgent;
  const vendor = window.navigator.vendor;
  
  let browser = 'unknown';
  let version = 'unknown';
  
  if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (/Firefox/.test(userAgent)) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (/Edg/.test(userAgent)) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'unknown';
  }
  
  return {
    browser,
    version,
    isSafari: browser === 'Safari',
    userAgent,
    vendor
  };
};

export const isVoiceCompatible = () => {
  const { isSafari: safari } = getBrowserInfo();
  
  // Safari has known issues with MediaRecorder and WebRTC
  // Return false for Safari until issues are resolved
  if (safari) return false;
  
  // Check for required APIs
  const hasMediaDevices = typeof navigator !== 'undefined' && 
                          navigator.mediaDevices && 
                          navigator.mediaDevices.getUserMedia;
  
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
  
  return hasMediaDevices && hasMediaRecorder;
};
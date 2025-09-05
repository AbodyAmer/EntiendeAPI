const UAParser = require('ua-parser-js');

const clientDetector = (req, res, next) => {
  const parser = new UAParser(req.headers['user-agent']);
  const device = parser.getDevice();
  const os = parser.getOS();
  
  // Determine if it's a mobile app or web browser
  req.clientInfo = {
    isMobile: device.type === 'mobile' || device.type === 'tablet',
    isDesktop: !device.type || device.type === 'desktop',
    deviceType: device.type || 'unknown',
    deviceModel: device.model || 'unknown',
    deviceVendor: device.vendor || 'unknown',
    osName: os.name || 'unknown',
    osVersion: os.version || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  };
  
  // Check if it's a native mobile app (common patterns)
  const userAgent = req.headers['user-agent'] || '';
  req.clientInfo.isNativeApp = 
    userAgent.includes('okhttp') ||  // Android apps often use OkHttp
    userAgent.includes('Expo') ||     // Expo/React Native
    userAgent.includes('CFNetwork') || // iOS native
    userAgent.includes('Dalvik') ||   // Android runtime
    userAgent.includes('ReactNative'); // React Native
  
  // Add client type for easy checking
  if (req.clientInfo.isNativeApp) {
    req.clientType = 'mobile-app';
  } else if (req.clientInfo.isMobile) {
    req.clientType = 'mobile-web';
  } else {
    req.clientType = 'desktop-web';
  }
  
  console.log(`Client detected: ${req.clientType} - ${req.clientInfo.deviceVendor} ${req.clientInfo.deviceModel} on ${req.clientInfo.osName} ${req.clientInfo.osVersion}`);
  next();
};

module.exports = { clientDetector };
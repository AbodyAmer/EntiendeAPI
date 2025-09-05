// middleware/clientDetector.js
const clientDetector = (req, res, next) => {
  // Detect client type based on headers
  console.log(req.headers)
  const clientType = req.headers['x-client-type'];
  const deviceId = req.headers['x-device-id'];
  
  // Determine client
  if (clientType === 'mobile' || deviceId) {
    req.client = {
      type: 'mobile',
      platform: req.headers['x-platform'] || 'unknown',
      version: req.headers['x-app-version'],
      deviceId: deviceId
    };
  } else if (req.headers.origin?.includes('efhamarabi.com')) {
    req.client = {
      type: 'web',
      origin: req.headers.origin
    };
  } else {
    req.client = {
      type: 'unknown'
    };
  }
  
  console.log(`Client detected: ${req.client.type}`);
  // Add client-specific helpers
  req.isMobile = req.client.type === 'mobile';
  req.isWeb = req.client.type === 'web';
  
  next();
};

module.exports = { clientDetector };
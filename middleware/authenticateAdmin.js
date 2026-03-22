const ADMIN_TOKEN = process.env.ADMIN_PASSWORD || 'admin123';

function authenticateAdmin(req, res, next) {
  // Check for X-Admin-Token header
  const token = req.headers['x-admin-token'];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }
  
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ 
      error: 'Access denied. Invalid token.' 
    });
  }
  
  next();
}

module.exports = authenticateAdmin;

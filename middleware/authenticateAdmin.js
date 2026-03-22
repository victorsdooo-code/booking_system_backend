const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'qingyiu_clinic_secret_key_2026';

const authenticateAdmin = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add admin info to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'admin'
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Authentication error.' 
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'admin'
      };
    }
    
    next();
  } catch (error) {
    // Token invalid, but continue without auth
    next();
  }
};

module.exports = {
  authenticateAdmin,
  optionalAuth,
  JWT_SECRET
};

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak disediakan.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid atau kedaluwarsa.'
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.'
      });
    }
    next();
  };
};

// Shorthand middlewares
const authenticateToken = authMiddleware;
const authorizeAdmin = authorizeRoles('ADMIN');
const authorizeRestaurant = authorizeRoles('RESTAURANT');
const authorizeCustomer = authorizeRoles('CUSTOMER');

module.exports = { 
  authMiddleware, 
  authorizeRoles,
  authenticateToken,
  authorizeAdmin,
  authorizeRestaurant,
  authorizeCustomer
};

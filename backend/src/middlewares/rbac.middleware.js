// Strict roles check matching schema definitions
module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Forbidden: You do not have permission to perform this action.' 
      });
    }
    next();
  };
};
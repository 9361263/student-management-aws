/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - 'ADMIN', 'FACULTY', etc.
 */
const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user session found.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

const requireAdmin = requireRoles('ADMIN');
const requireFacultyOrAdmin = requireRoles('ADMIN', 'FACULTY');

module.exports = {
  requireRoles,
  requireAdmin,
  requireFacultyOrAdmin,
};

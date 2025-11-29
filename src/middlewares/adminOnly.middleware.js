export function adminOnly(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access forbidden. Admin privileges required",
    });
    return;
  }

  next();
}

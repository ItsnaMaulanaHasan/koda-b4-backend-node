import jwt from "jsonwebtoken";
import process from "process";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function authMiddleware(req, res, next) {
  const bearer = req.headers?.authorization ?? "";
  const prefix = "Bearer ";
  if (!bearer.startsWith(prefix)) {
    res.status(401).json({
      success: false,
      message: "Authorization header required or invalid format",
    });
    return;
  }

  const token = bearer.substring(prefix.length);

  try {
    const payload = jwt.verify(token, process.env.APP_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    req.jwtPaload = payload;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Failed to verify token",
      result: err.message,
    });
  }
}

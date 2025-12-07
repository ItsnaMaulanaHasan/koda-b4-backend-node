import jwt from "jsonwebtoken";
import process from "process";
import { getRedisClient } from "../lib/redis.js";

export async function authMiddleware(req, res, next) {
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
  const redis = getRedisClient();

  try {
    const blacklistKey = `blacklist:${token}`;
    const isBlacklisted = await redis.get(blacklistKey);

    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        message: "Token has been revoked, please login again",
      });
      return;
    }

    const payload = jwt.verify(token, process.env.APP_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
      token: token,
    };
    req.jwtPayload = payload;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Failed to verify token",
      error: err.message,
    });
  }
}

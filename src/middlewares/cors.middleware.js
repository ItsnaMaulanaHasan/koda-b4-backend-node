import cors from "cors";
import process from "node:process";

export function corsMiddleware() {
  const allowedOrigins = [
    process.env.ORIGIN_URL || "",
    process.env.ORIGIN_URL_VERCEL || "",
    process.env.ORIGIN_URL_VERCEL2 || "",
    "http://localhost:5173",
  ];

  return cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
}

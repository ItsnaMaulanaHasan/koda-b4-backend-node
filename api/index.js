import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import { corsMiddleware } from "../src/middlewares/cors.middleware.js";
import router from "../src/routers/index.js";

const app = express();
app.use(corsMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running well from serverless",
  });
});

app.use("/api", router);

import initDocs from "../src/lib/docs.js";
import { initRedis } from "../src/lib/redis.js";

await initRedis().catch((err) => console.error("Redis init failed:", err));
initDocs(app);

export default serverless(app);

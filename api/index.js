import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import initDocs from "../src/lib/docs.js";
import { initRedis } from "../src/lib/redis.js";
import { corsMiddleware } from "../src/middlewares/cors.middleware.js";
import router from "../src/routers/index.js";

const app = express();

let initialized = false;

async function initOnce() {
  if (initialized) return;
  await initRedis();
  initDocs(app);
  initialized = true;
}

app.use(async (req, res, next) => {
  await initOnce();
  next();
});

app.use(corsMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running well from serverless",
  });
});

export default serverless(app);

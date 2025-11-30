import "dotenv/config";
import express, { json, urlencoded } from "express";
import initDocs from "./src/lib/docs.js";
import { initRedis } from "./src/lib/redis.js";
import { corsMiddleware } from "./src/middlewares/cors.middleware.js";
import router from "./src/routers/index.js";

const app = express();

await initRedis();

initDocs(app);

app.use(corsMiddleware());
app.use(urlencoded());
app.use(json());

app.use("/", router);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running well",
  });
});

app.listen(8080, () => {
  console.log("App running on http://localhost:8080");
});

import "dotenv/config";
import express, { json, urlencoded } from "express";
import serverless from "serverless-http";
import initDocs from "../src/lib/docs.js";
import router from "../src/routers/index.js";

const app = express();

initDocs(app);

app.use(urlencoded({ extended: true }));

app.use(json());

app.use("/", router);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running well",
  });
});

export default serverless(app);

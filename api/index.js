import "dotenv/config";
import express, { json, urlencoded } from "express";
import serverless from "serverless-http";
import initDocs from "../src/lib/docs.js";
import router from "../src/routers/index.js";

const app = express();

try {
  initDocs(app);
} catch (error) {
  console.error("Error initializing docs:", error);
}

app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running well",
  });
});

app.use("/", router);

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default serverless(app, {
  binary: ["image/*", "application/pdf"],
});

import express from "express";
import pipelineRoutes from "./routes/pipelineRoutes";
import jobRoutes from "./routes/jobRoutes";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "OK" });
});

app.use("/api", pipelineRoutes);
app.use("/api", jobRoutes);
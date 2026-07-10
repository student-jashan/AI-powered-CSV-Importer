import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GrowEasy Backend is Running 🚀",
  });
});

// Routes
app.use("/api", uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  return res.status(400).json({
    success: false,
    message: err.message,
  });
});

export default app;
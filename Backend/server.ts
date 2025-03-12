import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.ts";
import cors from "cors";

import graphRoutes from "./routes/graphRoutes.ts";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use("/graph", graphRoutes);

app.get("/", (req, res) => {
  res.send("Graph Calculation API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import {
  createGraph,
  getGraphs,
  getGraphById,
  updateGraph,
  deleteGraph,
} from "../controllers/graphController.ts";

const router = express.Router();

router.post("/", createGraph);
router.get("/", getGraphs);
router.get("/:id", getGraphById);
router.put("/:id", updateGraph);
router.delete("/:id", deleteGraph);

export default router;

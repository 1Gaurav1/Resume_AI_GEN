import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  analyzeResume,
  analyzeJobDescription,
  resumeMatch,
  optimizeResume,
} from "../controllers/atsController.js";

const atsRouter = express.Router();

atsRouter.post("/analyze-resume", protect, analyzeResume);
atsRouter.post("/analyze-job-description", protect, analyzeJobDescription);
atsRouter.post("/resume-match", protect, resumeMatch);
atsRouter.post("/optimize-resume", protect, optimizeResume);

export default atsRouter;

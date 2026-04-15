import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  enhanceJobDescription,
  enhanceProfessionalSummary,
  uploadResume,
  generateCoverLetter,
  generateInterviewQuestions,
  generateSmartBullet
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/upload-resume", protect, uploadResume);
aiRouter.post("/cover-letter", protect, generateCoverLetter);
aiRouter.post("/interview-questions", protect, generateInterviewQuestions);
aiRouter.post("/smart-bullet", protect, generateSmartBullet);

export default aiRouter;

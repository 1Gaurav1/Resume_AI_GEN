import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { exportDocx } from "../controllers/exportController.js";

const exportRouter = express.Router();

exportRouter.get("/docx/:resumeId", protect, exportDocx);

export default exportRouter;

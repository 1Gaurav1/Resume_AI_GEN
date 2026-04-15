import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { generateShareLink, addCollaborator } from "../controllers/shareController.js";

const shareRouter = express.Router();

shareRouter.post("/:resumeId", protect, generateShareLink);
shareRouter.post("/:resumeId/collaborators", protect, addCollaborator);

export default shareRouter;

import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDb from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import atsRouter from "./routes/atsRoutes.js";
import shareRouter from "./routes/shareRoutes.js";
import exportRouter from "./routes/exportRoutes.js";
const app = express();
const PORT = process.env.PORT || 3000;

connectDb();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is live");
});

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/ats", atsRouter);
app.use("/api/share", shareRouter);
app.use("/api/export", exportRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

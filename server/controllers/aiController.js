import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(404).json({ message: "Missing required fields" });
    }

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else.",
    });
    const response = await model.generateContent(userContent);

    const enhancedContent = response.response.text();
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for enhancing a resume's job description
// POST: /api/ai/enhance-pro-sum
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only 1-2 sentences also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else.",
    });
    const response = await model.generateContent(userContent);

    const enhancedContent = response.response.text();
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const systemPrompt =
      "You are an expert AI agent to extract date from resume.";

    const userPrompt = `extract data from this resume ${resumeText} Provide data in the following JSON format with no additional text before or after: 
      {
        professional_summary: { type: String, default: "" },
        skills: [{ type: String }],
        personal_info: {
          image: { type: String, default: "" },
          full_name: { type: String, default: "" },
          profession: { type: String, default: "" },
          email: { type: String, default: "" },
          phone: { type: String, default: "" },z
          location: { type: String, default: "" },
          linkedin: { type: String, default: "" },
          github: { type: String, default: "" },
          website: { type: String, default: "" },
        },
        experience: [
          {
            company: { type: String },
            position: { type: String },
            start_date: { type: String },
            end_date: { type: String },
            description: { type: String },
            is_current: { type: Boolean },
          },
        ],
        project: [
          {
            name: { type: String },
            type: { type: String },
            description: { type: String },
          },
        ],
        experience: [
          {
            insitution: { type: String },
            degree: { type: String },
            field: { type: String },
            graduation_date: { type: String },
            gpa: { type: String },
          },
        ],
      }
    `;

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" }
    });
    const response = await model.generateContent(userPrompt);

    const extractedData = response.response.text();

    const parsedData = JSON.parse(extractedData);

    const newResume = await Resume.create({ userId, title, ...parsedData });

    return res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/ai/cover-letter
export const generateCoverLetter = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) return res.status(400).json({ message: "Missing required fields" });

    const prompt = `You are an expert career bot. Generate 3 distinct versions of a cover letter (Formal, Friendly, Confident) using the following Resume JSON and Job Description.
    
Job Description:
${jobDescription}

Resume Data:
${JSON.stringify(resumeData)}

Return exactly valid JSON with this structure, no markdown wrappers: 
{ "formal": "...", "friendly": "...", "confident": "..." }`;

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const response = await model.generateContent(prompt);
    
    return res.status(200).json(JSON.parse(response.response.text()));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST: /api/ai/interview-questions
export const generateInterviewQuestions = async (req, res) => {
  try {
    const { missingSkills, jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ message: "Missing required fields" });

    const prompt = `You are a strict technical hiring manager. Based on this job description and the candidate's missing skills, generate 5-10 interview questions split into 'technical' and 'behavioral'.

Missing Skills: ${missingSkills?.join(", ") || "None"}
Job Description: ${jobDescription}

Return exactly valid JSON with this structure, no markdown wrappers:
{
  "technical": [{ "question": "...", "context": "..." }],
  "behavioral": [{ "question": "...", "context": "..." }]
}`;

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const response = await model.generateContent(prompt);
    
    return res.status(200).json(JSON.parse(response.response.text()));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST: /api/ai/smart-bullet
export const generateSmartBullet = async (req, res) => {
  try {
    const { bulletPoint } = req.body;
    if (!bulletPoint) return res.status(400).json({ message: "Missing required fields" });

    const prompt = `Rewrite this weak resume bullet point into a strong, ATS-optimized one. Use an action verb and implying measurable impact if possible. Return only the rewritten text without quotes.
    
Original: ${bulletPoint}`;

    const model = ai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });
    const response = await model.generateContent(prompt);
    
    return res.status(200).json({ rewritten: response.response.text().trim() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

import Resume from "../models/Resume.js";
import User from "../models/User.js";

// POST /api/share/:resumeId
export const generateShareLink = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { isPublic } = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId: req.userId },
      { public: isPublic },
      { new: true }
    );
    
    if (!resume) {
      return res.status(404).json({ message: "Resume not found or unauthorized" });
    }
    
    return res.status(200).json({ message: "Share settings updated", public: resume.public, resumeId: resume._id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/share/:resumeId/collaborators
export const addCollaborator = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { email, role } = req.body;
    
    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    if (!resume) return res.status(404).json({ message: "Resume not found or unauthorized" });
    
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: "User with this email not found" });
    
    // Check if already a collaborator
    const isAlreadyCollab = resume.collaborators.some(c => c.userId.toString() === userToAdd._id.toString());
    if (isAlreadyCollab) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }
    
    resume.collaborators.push({ userId: userToAdd._id, role: role || 'viewer' });
    await resume.save();
    
    return res.status(200).json({ message: "Collaborator added successfully", collaborators: resume.collaborators });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

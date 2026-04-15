import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import Resume from "../models/Resume.js";

export const exportDocx = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Ensure the requester owns or has access to it
    if (!resume.public && resume.userId.toString() !== req.userId) {
      const isCollab = resume.collaborators?.some(c => c.userId.toString() === req.userId);
      if (!isCollab) {
        return res.status(403).json({ message: "Not authorized to export this resume" });
      }
    }

    const { personal_info, professional_summary, experience, education, skills, project } = resume;

    // Build Word Document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: personal_info.full_name || "Name",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${personal_info.email || ""} | ${personal_info.phone || ""} | ${personal_info.location || ""}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${personal_info.linkedin || ""} | ${personal_info.github || ""}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Summary
          new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: professional_summary || "", spacing: { after: 300 } }),
          
          // Experience
          new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_1 }),
          ...(experience || []).map((exp) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${exp.position} - ${exp.company}`, bold: true }),
                new TextRun({ text: ` | ${exp.start_date} to ${exp.is_current ? 'Present' : exp.end_date}`, italics: true }),
              ],
            }),
            new Paragraph({ text: exp.description || "", spacing: { after: 200 } }),
          ]).flat(),
          
          // Projects
          new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_1 }),
          ...(project || []).map((p) => [
             new Paragraph({
               children: [
                 new TextRun({ text: p.name, bold: true }),
                 new TextRun({ text: p.type ? ` (${p.type})` : "", italics: true }),
               ]
             }),
             new Paragraph({ text: p.description || "", spacing: { after: 200 } })
          ]).flat(),

          // Education
          new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_1 }),
          ...(education || []).map((edu) => 
            new Paragraph({
              children: [
                 new TextRun({ text: `${edu.degree} in ${edu.field} - ${edu.institution}`, bold: true }),
                 new TextRun({ text: ` (${edu.graduation_date})`, italics: true })
              ],
              spacing: { after: 200 }
            })
          ),

          // Skills
          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: (skills || []).join(", ") })
        ],
      }],
    });

    const b64string = await Packer.toBase64String(doc);
    res.setHeader('Content-Disposition', `attachment; filename=${personal_info.full_name || 'resume'}.docx`);
    res.send(Buffer.from(b64string, 'base64'));

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

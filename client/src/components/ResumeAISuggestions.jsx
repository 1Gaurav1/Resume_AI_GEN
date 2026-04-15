import { useMemo } from "react";
import {
  BookOpen,
  FileText,
  Hash,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const ACTION_VERBS = [
  "developed","designed","built","created","implemented","led","managed","improved",
  "optimized","architected","engineered","delivered","launched","collaborated","coordinated",
  "analyzed","researched","solved","increased","decreased","reduced","achieved","generated",
  "automated","integrated","deployed","maintained","migrated","refactored","debugged",
];

const severityStyle = {
  high:   { badge: "bg-red-100 text-red-700 border-red-200",    dot: "bg-red-500",    label: "High Priority" },
  medium: { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Recommended" },
  low:    { badge: "bg-blue-100 text-blue-700 border-blue-200",  dot: "bg-blue-500",   label: "Optional" },
};

const SuggestionCard = ({ icon: Icon, title, description, severity, tip }) => {
  const s = severityStyle[severity] || severityStyle.low;
  return (
    <div className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white group">
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
          <Icon className="size-4 text-indigo-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
          <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-medium border rounded-full ${s.badge}`}>{s.label}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        {tip && (
          <p className="text-xs text-indigo-600 mt-1 italic">💡 {tip}</p>
        )}
      </div>
    </div>
  );
};

const ResumeAISuggestions = ({ resumeData }) => {
  const suggestions = useMemo(() => {
    const list = [];
    const pi = resumeData?.personal_info || {};
    const summary = resumeData?.professional_summary || "";
    const experience = resumeData?.experience || [];
    const skills = resumeData?.skills || resumeData?.skill || [];
    const education = resumeData?.education || [];
    const projects = resumeData?.project || [];

    // 1. Professional Summary
    if (!summary || summary.trim().length < 30) {
      list.push({
        icon: FileText, severity: "high",
        title: "Add a Professional Summary",
        description: "A compelling 2–3 sentence summary dramatically increases recruiter engagement and ATS ranking.",
        tip: "Mention your role title, years of experience, and 2–3 top skills.",
      });
    } else if (summary.length < 100) {
      list.push({
        icon: FileText, severity: "medium",
        title: "Expand Your Professional Summary",
        description: "Your summary is quite short. Aim for 100–200 characters to make a stronger first impression.",
        tip: "Include measurable impact (e.g. 'built systems serving 1M+ users').",
      });
    }

    // 2. Action Verbs
    const descText = experience.map((e) => (e.description || "").toLowerCase()).join(" ");
    const verbsFound = ACTION_VERBS.filter((v) => descText.includes(v));
    if (verbsFound.length < 3) {
      list.push({
        icon: Zap, severity: "high",
        title: "Strengthen Action Verbs in Experience",
        description: "Only " + verbsFound.length + " strong action verb(s) detected. Weak openings like 'Worked on' or 'Helped with' reduce ATS scores.",
        tip: "Start each bullet with: Developed, Engineered, Led, Optimized, Delivered, etc.",
      });
    }

    // 3. Measurable Achievements
    const hasNumbers = /\d+[%xX$kmKM]?/.test(descText);
    if (!hasNumbers) {
      list.push({
        icon: TrendingUp, severity: "high",
        title: "Add Measurable Achievements",
        description: "None of your experience bullets contain numbers or metrics. Quantifying results increases interview rates by up to 40%.",
        tip: "e.g. 'Reduced API response time by 35%' or 'Managed a team of 6 engineers'.",
      });
    }

    // 4. Skills Section
    if (skills.length < 5) {
      list.push({
        icon: Star, severity: "medium",
        title: "Expand Your Skills Section",
        description: `You have ${skills.length} skill(s) listed. ATS systems scan this section heavily — aim for 8–15 relevant skills.`,
        tip: "Include both technical skills (React, Python) and soft skills (Agile, Communication).",
      });
    }

    // 5. Contact Info
    if (!pi.linkedin) {
      list.push({
        icon: Hash, severity: "medium",
        title: "Add LinkedIn Profile",
        description: "88% of recruiters use LinkedIn. Adding your URL improves credibility and searchability.",
        tip: "Use a custom LinkedIn URL (linkedin.com/in/yourname).",
      });
    }
    if (!pi.github) {
      list.push({
        icon: Hash, severity: "low",
        title: "Add GitHub Profile",
        description: "For technical roles, a GitHub link lets recruiters verify your coding work directly.",
        tip: "Pin your best 4–6 repositories on GitHub before sharing.",
      });
    }

    // 6. Education
    if (education.length === 0) {
      list.push({
        icon: BookOpen, severity: "medium",
        title: "Add Education Details",
        description: "Many ATS filters require at least one education entry. Include degree, institution, and graduation year.",
      });
    }

    // 7. Projects
    if (projects.length === 0) {
      list.push({
        icon: Target, severity: "low",
        title: "Showcase Personal Projects",
        description: "Projects demonstrate initiative and real-world skills, especially valuable for early-career candidates.",
        tip: "Add 2–3 projects with tech stack, your role, and a link to demo or GitHub.",
      });
    }

    // 8. Job Description Coverage
    if (experience.length > 0) {
      const noDesc = experience.filter((e) => !e.description || e.description.trim().length < 50);
      if (noDesc.length > 0) {
        list.push({
          icon: FileText, severity: "medium",
          title: `Improve ${noDesc.length} Experience Description(s)`,
          description: "Some experience entries have very short or missing descriptions, which are skipped by ATS parsers.",
          tip: "Add 2–4 bullet points per role describing impact and technologies used.",
        });
      }
    }

    return list;
  }, [resumeData]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Star className="size-5" /> AI Suggestions Panel
        </h2>
        <p className="text-violet-100 text-xs mt-0.5">Personalized recommendations to improve your resume</p>
      </div>

      <div className="p-5">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="size-7 text-green-500 fill-green-200" />
            </div>
            <p className="text-slate-700 font-semibold">Great work!</p>
            <p className="text-slate-400 text-sm mt-1">Your resume looks comprehensive. No major issues found.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-800">{suggestions.length}</span> suggestions found
              </p>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{suggestions.filter((s) => s.severity === "high").length} high</span>
                <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{suggestions.filter((s) => s.severity === "medium").length} medium</span>
              </div>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} {...s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeAISuggestions;

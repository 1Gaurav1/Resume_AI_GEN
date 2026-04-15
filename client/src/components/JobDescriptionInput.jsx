import { useState } from "react";
import api from "../configs/api";
import { useSelector } from "react-redux";
import { BriefcaseIcon, SearchIcon, TagIcon, XCircleIcon } from "lucide-react";

const JobDescriptionInput = ({ onAnalyze }) => {
  const { token } = useSelector((state) => state.auth);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/ats/analyze-job-description",
        { jobDescription },
        { headers: { Authorization: token } }
      );
      setResult(data);
      onAnalyze && onAnalyze({ jobDescription, ...data });
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setJobDescription("");
    setResult(null);
    setError("");
    onAnalyze && onAnalyze(null);
  };

  const badgeColors = {
    skills: "bg-blue-50 text-blue-700 border-blue-200",
    tools: "bg-purple-50 text-purple-700 border-purple-200",
    keywords: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <BriefcaseIcon className="size-5" /> Job Description Analyzer
        </h2>
        <p className="text-blue-100 text-xs mt-0.5">Paste a job description to extract key requirements</p>
      </div>

      <div className="p-5">
        <div className="relative mb-3">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here…"
            rows={6}
            className="w-full p-3 pr-8 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
          {jobDescription && (
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircleIcon className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400">{jobDescription.length} characters</span>
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SearchIcon className="size-4" />
            )}
            {loading ? "Analyzing…" : "Analyze Job Description"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</p>
        )}

        {result && (
          <div className="space-y-4 border-t border-slate-100 pt-4">
            {result.skills?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <TagIcon className="size-3.5 text-blue-500" /> Required Skills ({result.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.skills.map((s) => (
                    <span key={s} className={`px-2.5 py-1 border rounded-full text-xs font-medium ${badgeColors.skills}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {result.tools?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <TagIcon className="size-3.5 text-purple-500" /> Tools & Technologies ({result.tools.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.tools.map((t) => (
                    <span key={t} className={`px-2.5 py-1 border rounded-full text-xs font-medium ${badgeColors.tools}`}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {result.responsibilities?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Key Responsibilities</h4>
                <ul className="space-y-1.5">
                  {result.responsibilities.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600">
                      <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescriptionInput;

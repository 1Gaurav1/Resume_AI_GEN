import { useState } from "react";
import api from "../configs/api";
import { useSelector } from "react-redux";
import { AlertCircle, BarChart3, CheckCircle2, MinusCircle, XCircle } from "lucide-react";

const PercentageRing = ({ pct }) => {
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
        <span className="text-[10px] text-slate-400">match</span>
      </div>
    </div>
  );
};

const SkillChip = ({ skill, type }) => {
  const styles = {
    matched: "bg-green-50 text-green-700 border-green-200",
    missing: "bg-red-50 text-red-600 border-red-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const icons = {
    matched: <CheckCircle2 className="size-3 shrink-0" />,
    missing: <XCircle className="size-3 shrink-0" />,
    partial: <MinusCircle className="size-3 shrink-0" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs font-medium ${styles[type]}`}>
      {icons[type]} {skill}
    </span>
  );
};

const ResumeMatchAnalysis = ({ resumeData, jobDescription }) => {
  const { token } = useSelector((state) => state.auth);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!jobDescription) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/ats/resume-match",
        { resumeData, jobDescription },
        { headers: { Authorization: token } }
      );
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <BarChart3 className="size-5" /> Resume Match Analysis
        </h2>
        <p className="text-emerald-100 text-xs mt-0.5">Compare your resume against the job requirements</p>
      </div>

      <div className="p-5">
        {!jobDescription && (
          <div className="text-center py-6 text-slate-400 text-sm">
            <p>Analyze a job description first to enable resume matching.</p>
          </div>
        )}

        {jobDescription && !result && !loading && (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm mb-4">Ready to compare your resume against the job description.</p>
            <button
              onClick={analyze}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Run Match Analysis
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Matching resume against job…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </div>
        )}

        {result && !loading && (
          <>
            {/* Match Percentage */}
            <div className="flex flex-col items-center mb-6">
              <PercentageRing pct={result.matchPercentage} />
              <p className="text-xs text-slate-500 mt-1">
                {result.matchedSkills?.length} of {result.totalJobKeywords} job requirements matched
              </p>
            </div>

            {/* Matched Skills */}
            {result.matchedSkills?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-green-500" /> Matched Skills ({result.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map((s) => <SkillChip key={s} skill={s} type="matched" />)}
                </div>
              </div>
            )}

            {/* Partial Matches */}
            {result.partialMatches?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <MinusCircle className="size-3.5 text-amber-500" /> Partial Matches ({result.partialMatches.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.partialMatches.map((s) => <SkillChip key={s} skill={s} type="partial" />)}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <XCircle className="size-3.5 text-red-500" /> Missing Skills ({result.missingSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => <SkillChip key={s} skill={s} type="missing" />)}
                </div>
              </div>
            )}

            <button
              onClick={analyze}
              className="mt-2 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200 transition-colors"
            >
              Re-run Analysis
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeMatchAnalysis;

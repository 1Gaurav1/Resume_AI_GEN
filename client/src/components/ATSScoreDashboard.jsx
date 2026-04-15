import { useEffect, useState } from "react";
import api from "../configs/api";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

const ScoreRing = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "Good" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: "-88px" }}>
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-500">/100</span>
      </div>
      <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  );
};

const BreakdownBar = ({ label, value, max, color }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs text-slate-600 mb-1">
      <span>{label}</span>
      <span className="font-semibold">{value}/{max}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const ATSScoreDashboard = ({ resumeData }) => {
  const { token } = useSelector((state) => state.auth);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/ats/analyze-resume",
        { resumeData },
        { headers: { Authorization: token } }
      );
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (resumeData?.personal_info || resumeData?.professional_summary) {
      analyze();
    }
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <TrendingUp className="size-5" /> ATS Score Dashboard
        </h2>
        <p className="text-indigo-100 text-xs mt-0.5">How well your resume passes Applicant Tracking Systems</p>
      </div>

      <div className="p-5">
        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Analyzing your resume…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </div>
        )}

        {result && !loading && (
          <>
            {/* Score Ring */}
            <div className="relative flex justify-center mb-6">
              <ScoreRing score={result.score} />
            </div>

            {/* Breakdown */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Score Breakdown</h3>
              <BreakdownBar label="Keyword Relevance" value={result.breakdown.keywordRelevance} max={40} color="#6366f1" />
              <BreakdownBar label="Resume Structure" value={result.breakdown.resumeStructure} max={20} color="#8b5cf6" />
              <BreakdownBar label="Content Quality" value={result.breakdown.contentQuality} max={20} color="#06b6d4" />
              <BreakdownBar label="Readability" value={result.breakdown.readability} max={10} color="#10b981" />
              <BreakdownBar label="Formatting" value={result.breakdown.formatting} max={10} color="#f59e0b" />
            </div>

            {/* Matched Keywords */}
            {result.matchedKeywords?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="size-4 text-green-500" /> Detected Keywords
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="border border-amber-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-amber-500" />
                    {result.suggestions.length} Improvement Suggestions
                  </span>
                  {showSuggestions ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {showSuggestions && (
                  <ul className="px-4 py-3 space-y-2 bg-white">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-600">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={analyze}
              className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 transition-colors"
            >
              Refresh Analysis
            </button>
          </>
        )}

        {!result && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm mb-4">Add resume content and click below to analyze.</p>
            <button
              onClick={analyze}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Analyze Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSScoreDashboard;

import { useState } from "react";
import api from "../configs/api";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  XIcon,
} from "lucide-react";

const DiffRow = ({ label, original, optimized }) => {
  const changed = original !== optimized && optimized;
  if (!changed) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 leading-relaxed">
          <p className="font-semibold text-red-500 mb-1">Before</p>
          {original || <span className="italic text-red-400">Empty</span>}
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 leading-relaxed">
          <p className="font-semibold text-green-600 mb-1">After ✨</p>
          {optimized}
        </div>
      </div>
    </div>
  );
};

const OptimizeResumeButton = ({ resumeData, jobDescription, onOptimized }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleOptimize = async () => {
    if (!jobDescription) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/ats/optimize-resume",
        { resumeData, jobDescription },
        { headers: { Authorization: token } }
      );
      setOptimizedResume(data.optimizedResume);
      setShowModal(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  };

  const handleAccept = () => {
    onOptimized && onOptimized(optimizedResume);
    setShowModal(false);
    setOptimizedResume(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setOptimizedResume(null);
  };

  // Build diff highlights
  const diffs = [];
  if (optimizedResume) {
    if (optimizedResume.professional_summary !== resumeData.professional_summary) {
      diffs.push({
        label: "Professional Summary",
        original: resumeData.professional_summary,
        optimized: optimizedResume.professional_summary,
      });
    }
    (optimizedResume.experience || []).forEach((exp, i) => {
      const orig = (resumeData.experience || [])[i];
      if (orig && exp.description !== orig.description) {
        diffs.push({
          label: `Experience — ${exp.position || exp.company || `Role ${i + 1}`}`,
          original: orig.description,
          optimized: exp.description,
        });
      }
    });
    (optimizedResume.project || []).forEach((proj, i) => {
      const orig = (resumeData.project || [])[i];
      if (orig && proj.description !== orig.description) {
        diffs.push({
          label: `Project — ${proj.name || `Project ${i + 1}`}`,
          original: orig.description,
          optimized: proj.description,
        });
      }
    });
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Sparkles className="size-5" /> AI Resume Optimizer
          </h2>
          <p className="text-rose-100 text-xs mt-0.5">Rewrite your resume to match the job description using AI</p>
        </div>

        <div className="p-5">
          {!jobDescription && (
            <div className="text-center py-6">
              <Sparkles className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Analyze a job description first to enable AI optimization.</p>
            </div>
          )}

          {jobDescription && (
            <>
              <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-700 font-medium mb-1">What AI will do:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Rewrite bullet points with stronger action verbs</li>
                  <li>• Inject relevant keywords from the job description</li>
                  <li>• Improve your professional summary for this role</li>
                  <li>• Strengthen project descriptions</li>
                </ul>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-3">
                  <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
              )}

              <button
                onClick={handleOptimize}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Optimizing with AI…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    ✨ Optimize Resume for this Job
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">You can preview and accept changes before they're applied.</p>
            </>
          )}
        </div>
      </div>

      {/* Accept Changes Modal */}
      {showModal && optimizedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="size-5 text-orange-500" /> Optimized Resume Preview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{diffs.length} change(s) detected</p>
              </div>
              <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <XIcon className="size-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {diffs.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="size-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold">Resume Already Well-Optimized</p>
                  <p className="text-slate-400 text-sm mt-1">The AI found minimal changes needed for this job description.</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 mb-4 transition-colors"
                  >
                    <span>View Side-by-Side Diff</span>
                    {showDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {showDetails && (
                    <div className="space-y-4">
                      {diffs.map((d, i) => <DiffRow key={i} {...d} />)}
                    </div>
                  )}

                  {!showDetails && (
                    <div className="space-y-2">
                      {diffs.map((d, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                          <CheckCircle className="size-4 text-green-500 shrink-0" />
                          {d.label} improved
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="size-4" /> Accept Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OptimizeResumeButton;

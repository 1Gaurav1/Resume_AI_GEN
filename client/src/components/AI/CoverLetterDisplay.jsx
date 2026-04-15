import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FileText, Wand2, Check, Copy } from 'lucide-react';
import api from '../../configs/api';
import toast from 'react-hot-toast';

const CoverLetterDisplay = ({ resumeData }) => {
  const { token } = useSelector((state) => state.auth);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [letters, setLetters] = useState(null);
  const [activeTab, setActiveTab] = useState('formal');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jobDescription) return toast.error("Please provide a job description first.");
    setLoading(true);
    try {
      const { data } = await api.post(
        "/api/ai/cover-letter",
        { resumeData, jobDescription },
        { headers: { Authorization: token } }
      );
      setLetters(data);
    } catch (err) {
      toast.error("Failed to generate cover letters.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!letters) return;
    navigator.clipboard.writeText(letters[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText className="size-5 text-indigo-500" /> AI Cover Letter Generator
        </h2>
        <p className="text-sm text-slate-500 mt-1">Paste a job description to generate tailored cover letters.</p>
      </div>

      <div className="mb-4">
        <textarea
          rows={4}
          placeholder="Paste Job Description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={generate}
          disabled={loading || !jobDescription}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
        >
          {loading ? (
            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wand2 className="size-4" />
          )}
          {loading ? "Generating Docs..." : "Generate Letters"}
        </button>
      </div>

      {letters && (
        <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden relative">
          <div className="flex bg-slate-50 border-b border-slate-200">
            {['formal', 'friendly', 'confident'].map((tone) => (
              <button
                key={tone}
                onClick={() => setActiveTab(tone)}
                className={`flex-1 py-3 text-sm font-semibold capitalize transition ${
                  activeTab === tone 
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
          
          <div className="p-5 bg-white min-h-[250px] relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 transition"
              title="Copy to clipboard"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </button>
            <div className="whitespace-pre-wrap text-sm text-slate-700 pr-10 leading-relaxed font-sans">
              {letters[activeTab]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterDisplay;

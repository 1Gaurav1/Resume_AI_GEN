import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Wand2, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';
import api from '../../configs/api';
import toast from 'react-hot-toast';

const InterviewPrepModule = ({ missingSkills, jobDescription }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [tab, setTab] = useState('technical');

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(
        "/api/ai/interview-questions",
        { missingSkills: missingSkills || [], jobDescription },
        { headers: { Authorization: token } }
      );
      setQuestions(data);
      setOpenIndex(null);
    } catch (err) {
      toast.error("Failed to generate questions");
    }
    setLoading(false);
  };

  const QAItem = ({ q, index }) => {
    const isOpen = openIndex === index;
    return (
      <div className={`border ${isOpen ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'} rounded-lg mb-2 overflow-hidden transition-all duration-200`}>
        <button 
          onClick={() => setOpenIndex(isOpen ? null : index)}
          className="w-full px-4 py-3 flex items-start justify-between text-left focus:outline-none"
        >
          <span className="text-sm font-semibold text-slate-800 pr-4">{q.question}</span>
          {isOpen ? <ChevronDown className="size-4 shrink-0 text-indigo-500 mt-1" /> : <ChevronRight className="size-4 shrink-0 text-slate-400 mt-1" />}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-indigo-100 pt-3">
            <span className="font-semibold text-indigo-700 block mb-1">Context & Advice:</span>
            {q.context}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="size-5 text-indigo-500" /> AI Interview Prep
          </h2>
          <p className="text-sm text-slate-500 mt-1">Generate targeted questions based on the JD and your gaps.</p>
        </div>
        {!questions && (
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-semibold border border-indigo-100 whitespace-nowrap"
          >
            {loading ? <div className="size-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <Wand2 className="size-4" />}
            {loading ? "Generating..." : "Generate Q&A"}
          </button>
        )}
      </div>

      {questions && (
        <div className="mt-5 animate-in fade-in slide-in-from-bottom-2">
           <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
            <button
              onClick={() => setTab('technical')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${tab === 'technical' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
              Technical
            </button>
            <button
              onClick={() => setTab('behavioral')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition ${tab === 'behavioral' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
              Behavioral
            </button>
           </div>
           
           <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
             {questions[tab]?.map((q, idx) => <QAItem key={idx} index={idx} q={q} />)}
           </div>
           
           <div className="mt-4 flex justify-end">
              <button onClick={generate} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                <Briefcase className="size-3" /> Regenerate
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrepModule;

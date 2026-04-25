import React, { useState } from 'react';
import { Copy, Users, CheckCircle2, Shield, Eye, Edit2 } from 'lucide-react';
import api from '../../configs/api';
import toast from 'react-hot-toast';

const ShareModal = ({ resumeId, isPublic, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [currentIsPublic, setCurrentIsPublic] = useState(isPublic);
  const [copied, setCopied] = useState(false);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  const shareUrl = `${window.location.origin}/preview/${resumeId}`;

  const togglePublic = async () => {
    setLoading(true);
    try {
      await api.post(`/api/share/${resumeId}`, { isPublic: !currentIsPublic });
      setCurrentIsPublic(!currentIsPublic);
      toast.success(currentIsPublic ? "Resume is now private" : "Resume is now public");
      if(onUpdate) onUpdate(!currentIsPublic);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update sharing");
    }
    setLoading(false);
  };

  const addCollaborator = async () => {
    if(!email) return;
    setLoading(true);
    try {
      await api.post(`/api/share/${resumeId}/collaborators`, { email, role });
      toast.success("Collaborator added");
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add collaborator");
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="size-5 text-indigo-500" /> Share Resume
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Public Link Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Shield className="size-4 text-emerald-500" /> Public Access
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={currentIsPublic} onChange={togglePublic} disabled={loading} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            {currentIsPublic && (
              <div className="mt-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 pr-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className="bg-transparent border-none outline-none text-xs text-slate-600 flex-1 px-2"
                />
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Invites Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Invite Collaborators</h3>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="User's email address"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
              />
              <div className="flex gap-2">
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-1/3 text-sm border border-slate-200 rounded-lg px-2 py-2 outline-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button 
                  onClick={addCollaborator}
                  disabled={loading || !email}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors text-white text-sm font-semibold rounded-lg py-2"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareModal;

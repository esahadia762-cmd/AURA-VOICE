import React, { useState } from 'react';
import {
  Database,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

export const KnowledgeBaseTab: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { knowledgeDocs, addKnowledgeDoc, removeKnowledgeDoc } = useData();

  const userOrgId = user?.organizationId || 'default_org';
  const filteredDocs = isSuperAdmin && !user?.organizationId
    ? knowledgeDocs
    : knowledgeDocs.filter((d) => d.organizationId === userOrgId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleUploadSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addKnowledgeDoc({
      organizationId: userOrgId,
      title,
      fileName: title.toLowerCase().replace(/\s+/g, '_') + '.pdf',
      fileSize: 1024 * (Math.floor(Math.random() * 200) + 50),
      fileType: 'application/pdf',
      description,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Organization Knowledge Base</h2>
          <p className="text-xs text-slate-400">
            Ground your AI voice agents in verified company documentation, policy guides, and pricing tables.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Docs List */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Knowledge Documents Uploaded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your standard operating procedures, product FAQs, or service guides to ensure your voice agents provide grounded answers.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => removeKnowledgeDoc(doc.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {doc.description || 'Grounding reference for agent responses.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Indexed ({doc.tokenCount.toLocaleString()} tokens)</span>
                </span>
                <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upload Knowledge Document</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSample} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Service SLA & Escalation Protocols"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Description / Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the topics covered in this document for the vector index..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs resize-none"
                />
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-slate-800 text-center space-y-2 bg-slate-950/40">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">Select PDF, DOCX, or TXT file</div>
                <div className="text-[11px] text-slate-500">Max file size 25MB · Auto-chunked with pgvector</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Upload & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

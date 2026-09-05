import React, { useState, useEffect } from 'react';
import { useFeedback } from '../../context/FeedbackContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  InternalFeedbackItem,
  FeedbackType,
  FeedbackCategory,
  ProductionImpact
} from '../../types/feedback';
import { Priority, Attachment } from '../../types/common';
import { INITIAL_BOOKS } from '../../data/initialBooks';
import {
  Sparkles,
  ArrowUpRight,
  Info,
  AlertCircle,
  AlertOctagon,
  FileText,
  TrendingUp,
  Sliders,
  Paperclip,
  UploadCloud,
  X,
  CheckCircle2,
  Bookmark,
  Download
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  downloadAttachment,
  createSamplePngDataUrl,
  createSamplePdfDataUrl
} from '../../utils/exportUtils';

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InternalFeedbackItem | null;
}

const TYPE_OPTIONS: { type: FeedbackType; label: string; desc: string; icon: any }[] = [
  {
    type: 'Suggestion',
    label: 'Suggestion',
    desc: 'General idea or enhancement',
    icon: Info
  },
  {
    type: 'Improvement',
    label: 'Improvement',
    desc: 'Refining existing feature or workflow',
    icon: ArrowUpRight
  },
  {
    type: 'Feature Request',
    label: 'Feature Request',
    desc: 'New capability or tool integration',
    icon: Sparkles
  },
  {
    type: 'Usability Feedback',
    label: 'Usability Feedback',
    desc: 'UI clarity, ergonomics, or layout issue',
    icon: AlertCircle
  },
  {
    type: 'Process Issue',
    label: 'Process Issue',
    desc: 'Bottleneck or governance friction',
    icon: AlertOctagon
  }
];

const CATEGORY_OPTIONS: FeedbackCategory[] = [
  'Tool / UI',
  'Workflow',
  'EPUB Production',
  'Accessibility',
  'Quality Assurance',
  'Content',
  'Performance',
  'Automation',
  'Documentation',
  'Feature Request',
  'Process Improvement',
  'Other'
];

const MODULE_OPTIONS = [
  'Accessibility Checker',
  'Chapter Manager',
  'TOC Manager',
  'EPUB Compiler',
  'Spine Builder',
  'Metadata Editor',
  'Typesetting Tool',
  'Asset Validator'
];

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { createFeedback, updateFeedback } = useFeedback();
  const { addToast } = useToast();

  const isEditing = !!initialData;

  // Form States
  const [type, setType] = useState<FeedbackType>('Improvement');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('EPUB Production');
  const [relatedModule, setRelatedModule] = useState('Accessibility Checker');
  const [relatedBook, setRelatedBook] = useState('EPUB Accessibility Handbook');

  const [problemCurrentExperience, setProblemCurrentExperience] = useState('');
  const [suggestedImprovement, setSuggestedImprovement] = useState('');
  const [whoIsAffected, setWhoIsAffected] = useState('Accessibility Reviewers & QA Leads');
  const [frequency, setFrequency] = useState('Every EPUB release (multiple times daily)');
  const [productionImpact, setProductionImpact] = useState<ProductionImpact>('High');
  const [expectedBenefit, setExpectedBenefit] = useState('');
  const [priority, setPriority] = useState<Priority>('High');

  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [submittedBy, setSubmittedBy] = useState('Priya S.');
  const [team, setTeam] = useState('Accessibility Team');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setRelatedModule(initialData.relatedModule);
      setRelatedBook(initialData.relatedBook || '');
      setProblemCurrentExperience(initialData.problemCurrentExperience || '');
      setSuggestedImprovement(initialData.suggestedImprovement || '');
      setWhoIsAffected(initialData.whoIsAffected || '');
      setFrequency(initialData.frequency || '');
      setProductionImpact(initialData.productionImpact || 'Medium');
      setExpectedBenefit(initialData.expectedBenefit || '');
      setPriority(initialData.priority);
      setSuggestedSolution(initialData.suggestedSolution || '');
      setAttachments(initialData.attachments || []);
      setSubmittedBy(initialData.submittedBy);
      setTeam(initialData.team || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setType('Improvement');
    setTitle('');
    setDescription('');
    setProblemCurrentExperience('');
    setSuggestedImprovement('');
    setExpectedBenefit('');
    setSuggestedSolution('');
    setAttachments([]);
    setErrors({});
  };

  const handleAddSampleAttachment = (attachmentType: 'mockup' | 'pdf') => {
    const id = `f-att-${Date.now()}`;
    if (attachmentType === 'mockup') {
      const fileName = `workflow_mockup_${Date.now().toString().slice(-4)}.png`;
      setAttachments((prev) => [
        ...prev,
        {
          id,
          name: fileName,
          type: 'image/png',
          size: '1.1 MB',
          fileData: createSamplePngDataUrl(fileName, 'Feedback Proposal UI Architecture Mockup'),
          uploadedAt: '2026-09-05 09:35'
        }
      ]);
    } else {
      const fileName = 'publishing_enhancement_spec.pdf';
      setAttachments((prev) => [
        ...prev,
        {
          id,
          name: fileName,
          type: 'application/pdf',
          size: '420 KB',
          fileData: createSamplePdfDataUrl(fileName, 'PubVantage Enhancement Proposal Specification Document'),
          uploadedAt: '2026-09-05 09:35'
        }
      ]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Feedback title is required';
    if (!problemCurrentExperience.trim() && !description.trim()) {
      newErrors.problemCurrentExperience = 'Current experience or description is required';
    }
    if (!suggestedImprovement.trim()) {
      newErrors.suggestedImprovement = 'Suggested improvement is required';
    }
    if (!submittedBy.trim()) newErrors.submittedBy = 'Submitter name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Please complete required fields.', 'Check marked inputs above.', 'error');
      return;
    }

    setIsSubmitting(true);

    const feedbackPayload: Partial<InternalFeedbackItem> = {
      type,
      title,
      description: description.trim() || problemCurrentExperience,
      category,
      relatedModule,
      relatedBook: relatedBook || undefined,
      problemCurrentExperience,
      suggestedImprovement,
      whoIsAffected,
      frequency,
      productionImpact,
      expectedBenefit,
      priority,
      suggestedSolution,
      attachments,
      submittedBy,
      team: team || undefined
    };

    if (isEditing && initialData) {
      updateFeedback(initialData.id, feedbackPayload);
    } else {
      createFeedback(feedbackPayload);
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleSaveDraft = () => {
    addToast('Feedback draft saved.', 'Your ideas are saved locally.', 'info');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={isEditing ? `Edit Feedback (${initialData?.id})` : 'Submit Internal Feedback & Workflow Ideas'}
      subtitle="Share proposals, feature requests, and process improvements for the EPUB publishing ecosystem."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: FEEDBACK TYPE SELECTOR */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Sparkles size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Section 1 — Feedback Type
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {TYPE_OPTIONS.map((item) => {
              const isSelected = type === item.type;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <IconComponent
                      size={16}
                      className={isSelected ? 'text-indigo-600' : 'text-slate-500'}
                    />
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: FEEDBACK DETAILS */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Section 2 — Feedback Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Feedback Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Add bulk chapter validation and parallel EpubCheck batch runs"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Related Module</label>
                <select
                  value={relatedModule}
                  onChange={(e) => setRelatedModule(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Related Book / Project</label>
                <select
                  value={relatedBook}
                  onChange={(e) => setRelatedBook(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">General Publishing Suite</option>
                  {INITIAL_BOOKS.map((b) => (
                    <option key={b.id} value={b.title}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Problem / Current Experience <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={problemCurrentExperience}
                onChange={(e) => setProblemCurrentExperience(e.target.value)}
                placeholder="What is currently frustrating, slow, or error-prone about the current workflow?"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.problemCurrentExperience && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.problemCurrentExperience}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Suggested Improvement <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={suggestedImprovement}
                onChange={(e) => setSuggestedImprovement(e.target.value)}
                placeholder="What specific change or enhancement do you recommend?"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.suggestedImprovement && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.suggestedImprovement}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: IMPACT */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <TrendingUp size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Section 3 — Impact Assessment
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Who is Affected?</label>
              <input
                type="text"
                value={whoIsAffected}
                onChange={(e) => setWhoIsAffected(e.target.value)}
                placeholder="e.g. Accessibility reviewers, Typesetters"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Frequency of Occurrence</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Daily during QA, Every EPUB build"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Production Impact</label>
              <select
                value={productionImpact}
                onChange={(e) => setProductionImpact(e.target.value as ProductionImpact)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Critical">Critical Impact</option>
                <option value="High">High Impact</option>
                <option value="Medium">Medium Impact</option>
                <option value="Low">Low Impact</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Expected Benefit</label>
              <input
                type="text"
                value={expectedBenefit}
                onChange={(e) => setExpectedBenefit(e.target.value)}
                placeholder="e.g. Saves 2 hours per book title, avoids distribution rejections"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: SUGGESTED SOLUTION */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Sliders size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Section 4 — Suggested Solution
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe your suggested solution or improvement...
            </label>
            <textarea
              rows={3}
              value={suggestedSolution}
              onChange={(e) => setSuggestedSolution(e.target.value)}
              placeholder="Outline the UI design, technical approach, API, or operational checklist you envision..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 5: ATTACHMENTS */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Paperclip size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Section 5 — Attachments & Reference Documents
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSampleAttachment('mockup')}
                icon={<UploadCloud size={13} />}
              >
                + Add UI Mockup
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSampleAttachment('pdf')}
                icon={<FileText size={13} />}
              >
                + Add Specification Doc
              </Button>
            </div>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-purple-600 shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-slate-800 block truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {file.type} • {file.size}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAttachment(file, (title, desc, type) => {
                            addToast(title, desc || '', type || 'info');
                          });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Download attachment"
                        aria-label={`Download ${file.name}`}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(file.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove file"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: SUBMISSION */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <CheckCircle2 size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Section 6 — Submitter Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Submitted By <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.submittedBy && <p className="text-[11px] text-rose-500 mt-1">{errors.submittedBy}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department / Team</label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Accessibility Team"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleSaveDraft}
                icon={<Bookmark size={14} />}
              >
                Save Draft
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              icon={<CheckCircle2 size={14} />}
            >
              {isEditing ? 'Save Changes' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

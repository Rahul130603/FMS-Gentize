import React, { useState } from 'react';
import { X, Send, ThumbsUp, ThumbsDown, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

export default function FeedbackSubmitView({ isOpen, onClose, onSuccess }) {
  const [isbn, setIsbn] = useState('9781234567890');
  const [title, setTitle] = useState('Advanced File Processing Workflows');
  const [feedbackType, setFeedbackType] = useState('POSITIVE');
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [comment, setComment] = useState('');
  const [appreciationMessage, setAppreciationMessage] = useState('');
  const [criticMessage, setCriticMessage] = useState('');
  const [criticCategory, setCriticCategory] = useState('Cover Alignment');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Cover Alignment',
    'Spine Alignment',
    'Binding Quality',
    'Trim Margin',
    'Color Shift',
    'Page Bleed',
    'Delayed Delivery',
    'Typography Defect'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isbn || !title || !comment) {
      setErrorMsg('Please enter ISBN, Book Title, and Feedback Comment.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.submitCustomerFeedback({
        isbn,
        title,
        feedbackType,
        rating,
        customerName,
        customerCompany,
        comment,
        appreciationMessage: feedbackType === 'POSITIVE' ? appreciationMessage : null,
        criticMessage: feedbackType === 'NEGATIVE' ? criticMessage : null,
        criticCategory: feedbackType === 'NEGATIVE' ? criticCategory : null,
        submittedAt: new Date().toISOString()
      });

      if (res.success) {
        setSuccessMsg(`Feedback recorded successfully as ${res.data.feedback_number}!`);
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit customer feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Customer Feedback Inbound Portal
            </h3>
            <p className="text-xs text-slate-500">
              Submit real-time customer feedback against an ISBN (Permanent Archive)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                ISBN (13-Digits) *
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="e.g. 9781234567890"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced File Processing Workflows"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Feedback Type Toggle */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Feedback Sentiment Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType('POSITIVE');
                  if (rating < 4) setRating(5);
                }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  feedbackType === 'POSITIVE'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span>Positive Feedback</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFeedbackType('NEGATIVE');
                  if (rating > 3) setRating(2);
                }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  feedbackType === 'NEGATIVE'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-rose-500" />
                <span>Negative / Critic</span>
              </button>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Rating Score ({rating} Stars) *
            </label>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <StarRating
                rating={rating}
                size="lg"
                interactive={true}
                onChange={(r) => setRating(r)}
              />
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                Click star to select (1 - 5)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Company / Organization (Optional)
              </label>
              <input
                type="text"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="e.g. Apex Publishing"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Customer Feedback Comment *
            </label>
            <textarea
              required
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Excellent print quality and crisp typography..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Conditional Detail: Appreciation Message vs Critic Message */}
          {feedbackType === 'POSITIVE' ? (
            <div>
              <label className="block text-emerald-700 dark:text-emerald-300 font-bold mb-1">
                Appreciation Message / Specific Praises
              </label>
              <textarea
                rows={2}
                value={appreciationMessage}
                onChange={(e) => setAppreciationMessage(e.target.value)}
                placeholder="e.g. The page margin and color grading were completely spotless."
                className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-rose-700 dark:text-rose-300 font-bold mb-1">
                  Critic Root Cause Category
                </label>
                <select
                  value={criticCategory}
                  onChange={(e) => setCriticCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-rose-700 dark:text-rose-300 font-bold mb-1">
                  Critic Details &amp; Defect Description
                </label>
                <textarea
                  rows={2}
                  value={criticMessage}
                  onChange={(e) => setCriticMessage(e.target.value)}
                  placeholder="e.g. The title text on the spine was shifted 3mm to the left..."
                  className="w-full px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit & Store Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


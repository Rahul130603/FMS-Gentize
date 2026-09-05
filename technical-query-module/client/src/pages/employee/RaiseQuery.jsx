import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import FileUpload from '../../components/common/FileUpload';
import IsbnHistoryPanel from '../../components/technicalQuery/IsbnHistoryPanel';
import { CATEGORIES, PRIORITIES } from '../../constants';
import { technicalQueryApi } from '../../api/technicalQueryApi';

const initialForm = { category: '', priority: 'normal', isbn: '', subject: '', description: '' };

export default function RaiseQuery() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Please select a category';
    if (!form.subject || form.subject.trim().length < 5) e.subject = 'Subject must be at least 5 characters';
    if (!form.description || form.description.trim().length < 10) e.description = 'Please describe the issue in more detail (min 10 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('attachments', f));
      const res = await technicalQueryApi.create(fd);
      setSuccess(res.data);
      setForm(initialForm);
      setFiles([]);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to submit query' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card p-8 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
          <h2 className="text-lg font-semibold mt-3 text-gray-900 dark:text-gray-50">Query Submitted Successfully</h2>
          <p className="text-sm text-gray-500 mt-1">Your technical query has been logged with the reference number:</p>
          <p className="text-2xl font-bold text-brand-700 dark:text-brand-400 mt-3 tracking-wide">{success.query_number}</p>
          <div className="flex justify-center gap-2 mt-6">
            <button className="btn-secondary" onClick={() => setSuccess(null)}>Raise Another</button>
            <button className="btn-primary" onClick={() => navigate(`/technical-query/my-queries/${success.id}`)}>
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ label: 'Technical Query', to: '/technical-query/raise' }, { label: 'Raise Technical Query' }]} />
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">Raise a Technical Query</h2>
        <p className="text-sm text-gray-500 mb-6">Report an issue related to a file or the FMS software. Our support team will pick it up shortly.</p>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="label">Priority *</label>
              <select className="input" value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">ISBN (optional)</label>
            <input className="input" value={form.isbn} onChange={(e) => setField('isbn', e.target.value)} placeholder="e.g. 978-93-5234-101-2" />
            <IsbnHistoryPanel isbn={form.isbn} />
          </div>

          <div>
            <label className="label">Subject *</label>
            <input className="input" value={form.subject} onChange={(e) => setField('subject', e.target.value)} placeholder="Brief summary of the issue" maxLength={200} />
            {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={6} value={form.description} onChange={(e) => setField('description', e.target.value)}
              placeholder="Describe the issue, steps to reproduce, and any error messages you saw…" />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="label">Attachments</label>
            <FileUpload files={files} onChange={setFiles} />
          </div>

          {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              <Send size={15} /> {submitting ? 'Submitting…' : 'Submit Query'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

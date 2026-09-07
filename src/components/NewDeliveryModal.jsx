import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

export default function NewDeliveryModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customer: 'Academic Press',
    type: 'POD',
    filesCount: 1,
    pagesCount: 320,
    channel: 'SFTP Server',
    status: 'Delivered',
    fileName: 'ACAD-2026-VOL4.pdf'
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        customer: formData.customer,
        type: formData.type,
        filesCount: Number(formData.filesCount),
        pagesCount: Number(formData.pagesCount),
        channel: formData.channel,
        status: formData.status,
        files: [
          {
            name: formData.fileName || `${formData.type}_output_${Date.now()}.pdf`,
            size: `${(Math.random() * 20 + 5).toFixed(1)} MB`,
            pages: Number(formData.pagesCount),
            format: formData.type
          }
        ]
      });
      onClose();
    } catch (err) {
      alert(`Error saving delivery: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Record Production Dispatch</h4>
            <p className="text-xs text-slate-500">Log a new delivery to the registry database</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Customer */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer / Client</label>
            <select
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="Academic Press">Academic Press</option>
              <option value="Global Library">Global Library</option>
              <option value="Pearson Education">Pearson Education</option>
              <option value="Elsevier Science">Elsevier Science</option>
              <option value="Springer Nature">Springer Nature</option>
              <option value="Oxford University Press">Oxford University Press</option>
            </select>
          </div>

          {/* Production Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Production Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="POD">POD</option>
                <option value="EPDF">EPDF</option>
                <option value="SCANNED FILE">SCANNED FILE</option>
                <option value="E-ISBN">E-ISBN</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dispatch Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Delivered">Delivered</option>
                <option value="In Transit">In Transit</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Files Count</label>
              <input
                type="number"
                min="1"
                value={formData.filesCount}
                onChange={(e) => setFormData({ ...formData, filesCount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Pages</label>
              <input
                type="number"
                min="1"
                value={formData.pagesCount}
                onChange={(e) => setFormData({ ...formData, pagesCount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Delivery Channel */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Delivery Channel</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="SFTP Server">SFTP Server</option>
              <option value="AWS S3 Bucket">AWS S3 Bucket</option>
              <option value="Direct Client API">Direct Client API</option>
              <option value="Enterprise Secure FTP">Enterprise Secure FTP</option>
              <option value="Aspera High-Speed Transfer">Aspera High-Speed Transfer</option>
            </select>
          </div>

          {/* File Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary File Name</label>
            <input
              type="text"
              value={formData.fileName}
              onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
              placeholder="e.g. 9780132350884_delivery.pdf"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {submitting ? 'Saving...' : 'Record Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

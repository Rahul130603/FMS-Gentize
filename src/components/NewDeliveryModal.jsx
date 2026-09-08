import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Check,
  FileSpreadsheet,
  FileEdit,
  UploadCloud,
  Download,
  AlertCircle,
  FileText,
  Trash2,
  PackagePlus
} from 'lucide-react';
import * as XLSX from 'xlsx';

const CUSTOMERS = [
  'ABC Publishing',
  'XYZ Books',
  'Global Publications',
  'Prime Publishers',
  'Sunrise Publications',
  'Knowledge House'
];

const TYPES = ['POD', 'EPDF', 'SCANNED FILE', 'E-ISBN'];
const ROLES = ['QC', 'QAG', 'TL', 'MANAGER'];
const STATUSES = ['Delivered', 'Pending', 'In Progress'];

export default function NewDeliveryModal({ onClose, onSubmit, onBulkSubmit, showToast }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'sheet'

  // Single Entry Form State
  const [formData, setFormData] = useState({
    customer: 'ABC Publishing',
    isbn: '978-0-13-235088-4',
    title: '',
    author: '',
    type: 'POD',
    qty: 1,
    date: '08 Sep 2026',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    deliveredBy: 'QC',
    status: 'Delivered',
    fileName: ''
  });

  // Sheet Upload State
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Single Form Submit
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      if (showToast) showToast('Please enter book title');
      return;
    }

    setSubmitting(true);
    try {
      const deliveryPayload = {
        customer: formData.customer,
        isbn: formData.isbn.trim() || `978-0-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(10 + Math.random() * 90)}-1`,
        title: formData.title.trim(),
        author: formData.author.trim() || 'Editorial Board',
        type: formData.type,
        qty: Number(formData.qty) || 1,
        date: formData.date || '08 Sep 2026',
        time: formData.time || '12:00 PM',
        deliveredBy: formData.deliveredBy,
        status: formData.status,
        file: formData.fileName.trim() || `${formData.title.trim().replace(/[^\w\d]/g, '_')}_${formData.type}.pdf`
      };

      await onSubmit(deliveryPayload);
      if (showToast) showToast(`Delivery recorded: ${deliveryPayload.title}`);
      onClose();
    } catch (err) {
      if (showToast) showToast(`Error saving delivery: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle File Drag & Drop or Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processSpreadsheetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSpreadsheetFile(file);
  };

  const processSpreadsheetFile = (file) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          if (showToast) showToast('Uploaded sheet appears to be empty.');
          setParsedRows([]);
          return;
        }

        // Map columns flexibly
        const mapped = rawJson.map((row, index) => {
          const customer =
            row['Customer'] || row['customer'] || row['Client'] || row['client'] || 'ABC Publishing';
          const title =
            row['Title'] || row['title'] || row['Book Title'] || row['Book'] || `Production Book ${index + 1}`;
          const author =
            row['Author'] || row['author'] || row['Writer'] || 'Editorial Board';
          const isbn =
            row['ISBN'] || row['isbn'] || `978-0-${Math.floor(100000 + Math.random() * 900000)}-1`;
          const typeRaw = (row['Type'] || row['type'] || row['Production Type'] || 'POD').toUpperCase();
          const type = TYPES.includes(typeRaw) ? typeRaw : 'POD';
          const qty = Number(row['Quantity'] || row['qty'] || row['Qty'] || 1) || 1;
          const deliveredBy = (row['Delivered By'] || row['deliveredBy'] || row['Role'] || 'QC').toUpperCase();
          const status = row['Status'] || row['status'] || 'Delivered';
          const date = row['Date'] || row['date'] || '08 Sep 2026';
          const time = row['Time'] || row['time'] || '12:00 PM';
          const file =
            row['File Name'] || row['file'] || `${title.replace(/[^\w\d]/g, '_')}_${type}.pdf`;

          return {
            id: row['Delivery ID'] || row['id'] || `DEL-${String(Date.now() + index).slice(-5)}`,
            customer,
            title,
            author,
            isbn,
            type,
            qty,
            deliveredBy: ROLES.includes(deliveredBy) ? deliveredBy : 'QC',
            status,
            date,
            time,
            file
          };
        });

        setParsedRows(mapped);
        if (showToast) showToast(`Parsed ${mapped.length} deliveries from ${file.name}`);
      } catch (err) {
        if (showToast) showToast(`Failed to parse sheet: ${err.message}`);
        setParsedRows([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Sample CSV Template
  const handleDownloadSample = () => {
    const sampleRows = [
      {
        'Delivery ID': 'DEL-2026-030',
        'Customer': 'ABC Publishing',
        'ISBN': '978-0-13-235088-4',
        'Title': 'Modern Publishing Standards',
        'Author': 'Arthur C. Miller',
        'Type': 'POD',
        'Quantity': 2,
        'Date': '08 Sep 2026',
        'Time': '10:30 AM',
        'Delivered By': 'QC',
        'Status': 'Delivered'
      },
      {
        'Delivery ID': 'DEL-2026-031',
        'Customer': 'XYZ Books',
        'ISBN': '978-0-321-35668-0',
        'Title': 'Advanced Editorial Layouts',
        'Author': 'Joshua Bloch',
        'Type': 'EPDF',
        'Quantity': 1,
        'Date': '08 Sep 2026',
        'Time': '11:15 AM',
        'Delivered By': 'QAG',
        'Status': 'Delivered'
      },
      {
        'Delivery ID': 'DEL-2026-032',
        'Customer': 'Global Publications',
        'ISBN': '978-0-201-63361-0',
        'Title': 'Digital Archival Production',
        'Author': 'Erich Gamma',
        'Type': 'SCANNED FILE',
        'Quantity': 3,
        'Date': '08 Sep 2026',
        'Time': '02:00 PM',
        'Delivered By': 'TL',
        'Status': 'In Progress'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery_Template');
    XLSX.writeFile(wb, 'Delivery_Production_Sample_Sheet.xlsx');
    if (showToast) showToast('Sample Excel template downloaded.');
  };

  // Handle Bulk Import Submit
  const handleBulkSubmit = async () => {
    if (parsedRows.length === 0) return;
    setSubmitting(true);
    try {
      await onBulkSubmit(parsedRows);
      if (showToast) showToast(`Successfully imported ${parsedRows.length} deliveries.`);
      onClose();
    } catch (err) {
      if (showToast) showToast(`Bulk import failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
              <PackagePlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Add Production Delivery
              </h3>
              <p className="text-2xs text-slate-400">
                Log new customer delivery via single manual entry or bulk spreadsheet upload
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center space-x-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'sheet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Upload Sheet (Excel / CSV)</span>
            {parsedRows.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-bold ml-1">
                {parsedRows.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'single' ? (
            /* TAB 1: MANUAL ENTRY FORM */
            <form id="new-delivery-form" onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Customer / Publishing House *
                  </label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-semibold bg-white cursor-pointer"
                  >
                    {CUSTOMERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Production Type */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Production Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-semibold bg-white cursor-pointer"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Book Title */}
                <div className="sm:col-span-2">
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Fundamental Publishing Workflow"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-semibold bg-white"
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="e.g. 978-0-13-235088-4"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono font-medium bg-white"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Prof. David Miller"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium bg-white"
                  />
                </div>

                {/* Delivered By */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Delivered By (Role) *
                  </label>
                  <select
                    value={formData.deliveredBy}
                    onChange={(e) => setFormData({ ...formData, deliveredBy: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-bold bg-white cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Quantity / Files Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-semibold bg-white"
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 08 Sep 2026"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium bg-white"
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Delivery Time
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium bg-white"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-semibold bg-white cursor-pointer"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom File Name (Optional) */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    File Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono font-medium bg-white"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: SHEET / EXCEL / CSV UPLOAD */
            <div className="space-y-4">
              {/* Instructions & Template Download Bar */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-blue-900 font-medium">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Upload an Excel (.xlsx, .xls) or CSV sheet with delivery records.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-2.5 py-1 bg-white border border-blue-200 hover:border-blue-300 text-blue-700 rounded-lg text-2xs font-bold flex items-center space-x-1.5 shadow-2xs hover:bg-blue-50/50 cursor-pointer shrink-0 ml-2"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sample Template</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {uploadedFileName ? (
                        <span className="text-blue-600">{uploadedFileName}</span>
                      ) : (
                        'Click to browse or drag & drop sheet file here'
                      )}
                    </p>
                    <p className="text-2xs text-slate-400 mt-0.5">
                      Supports Excel (.xlsx, .xls) and Comma-Separated (.csv) files
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">Preview Parsed Records:</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-2xs rounded-full">
                        {parsedRows.length} Deliveries Ready
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setParsedRows([]);
                        setUploadedFileName('');
                      }}
                      className="text-rose-600 hover:text-rose-800 text-2xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-2xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-1.5">Title</th>
                          <th className="px-3 py-1.5">Customer</th>
                          <th className="px-3 py-1.5">Type</th>
                          <th className="px-3 py-1.5">Qty</th>
                          <th className="px-3 py-1.5">By</th>
                          <th className="px-3 py-1.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-semibold text-slate-900 truncate max-w-[150px]">
                              {r.title}
                            </td>
                            <td className="px-3 py-1.5 truncate max-w-[120px]">{r.customer}</td>
                            <td className="px-3 py-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px]">
                                {r.type}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 font-bold">{r.qty}</td>
                            <td className="px-3 py-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                                {r.deliveredBy}
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
                              <span className="text-emerald-600 font-semibold">{r.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-2xs text-slate-400">
            {activeTab === 'single'
              ? 'Creates 1 new delivery record immediately'
              : `${parsedRows.length} records will be imported into delivery registry`}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
            >
              Cancel
            </button>

            {activeTab === 'single' ? (
              <button
                type="submit"
                form="new-delivery-form"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{submitting ? 'Saving...' : 'Save Delivery'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={submitting || parsedRows.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {submitting
                    ? 'Importing...'
                    : parsedRows.length > 0
                    ? `Import ${parsedRows.length} Deliveries`
                    : 'Import Sheet'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

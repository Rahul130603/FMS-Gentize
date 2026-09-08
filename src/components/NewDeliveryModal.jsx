import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Check,
  FileSpreadsheet,
  FileEdit,
  UploadCloud,
  Download,
  Trash2,
  PackagePlus,
  Calendar,
  UserCheck,
  Hash,
  Sparkles
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
const TODAY_STR = '08 Sep 2026';

export default function NewDeliveryModal({ onClose, onSubmit, onBulkSubmit, showToast }) {
  const [activeTab, setActiveTab] = useState('sheet'); // Default to sheet or single as convenient

  // Single Entry Form State
  const [formData, setFormData] = useState({
    customer: 'ABC Publishing',
    isbn: '978-0-13-235088-4',
    title: '',
    author: '',
    type: 'POD',
    qty: 1,
    date: TODAY_STR,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    deliveredBy: 'QC',
    status: 'Delivered',
    fileName: ''
  });

  // Sheet Upload Configuration States
  const [sheetDeliveredBy, setSheetDeliveredBy] = useState('QC');
  const [sheetDeliveryDate, setSheetDeliveryDate] = useState(TODAY_STR);
  const [applyRoleToAll, setApplyRoleToAll] = useState(true);
  const [applyTodayDate, setApplyTodayDate] = useState(true);

  // Sheet Upload Data States
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to generate realistic ISBN-13
  const generateRandomISBN = () => {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(10000 + Math.random() * 90000);
    const part3 = Math.floor(10 + Math.random() * 90);
    const part4 = Math.floor(1 + Math.random() * 9);
    return `978-${part1}-${part2}-${part3}-${part4}`;
  };

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
        isbn: formData.isbn.trim() || generateRandomISBN(),
        title: formData.title.trim(),
        author: formData.author.trim() || 'Editorial Board',
        type: formData.type,
        qty: Number(formData.qty) || 1,
        date: formData.date || TODAY_STR,
        time: formData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        deliveredBy: formData.deliveredBy,
        status: formData.status,
        file: formData.fileName.trim() || `${formData.title.trim().replace(/[^\w\d]/g, '_')}_${formData.type}.pdf`
      };

      await onSubmit(deliveryPayload);
      if (showToast) showToast(`Delivery recorded: ${deliveryPayload.title} by ${deliveryPayload.deliveredBy}`);
      onClose();
    } catch (err) {
      if (showToast) showToast(`Error saving delivery: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Change Role for Sheet and batch update parsed rows if applyRoleToAll is on
  const handleSelectSheetRole = (role) => {
    setSheetDeliveredBy(role);
    if (applyRoleToAll && parsedRows.length > 0) {
      setParsedRows((prev) =>
        prev.map((row) => ({
          ...row,
          deliveredBy: role
        }))
      );
      if (showToast) showToast(`Updated all ${parsedRows.length} sheet deliveries to role: ${role}`);
    }
  };

  // Change Date for Sheet and batch update parsed rows if applyTodayDate is on
  const handleDateChange = (newDate) => {
    setSheetDeliveryDate(newDate);
    if (applyTodayDate && parsedRows.length > 0) {
      setParsedRows((prev) =>
        prev.map((row) => ({
          ...row,
          date: newDate
        }))
      );
    }
  };

  // Toggle Apply Today Date
  const handleToggleApplyTodayDate = (checked) => {
    setApplyTodayDate(checked);
    if (checked && parsedRows.length > 0) {
      setParsedRows((prev) =>
        prev.map((row) => ({
          ...row,
          date: sheetDeliveryDate
        }))
      );
    }
  };

  // Change individual row role in preview table
  const handleRowRoleChange = (index, newRole) => {
    setParsedRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], deliveredBy: newRole };
      return updated;
    });
  };

  // Delete individual row from parsed preview
  const handleDeleteRow = (index) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
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

        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Map columns flexibly
        const mapped = rawJson.map((row, index) => {
          const customer =
            row['Customer'] || row['customer'] || row['Client'] || row['client'] || 'ABC Publishing';
          const title =
            row['Title'] || row['title'] || row['Book Title'] || row['Book'] || `Production Book ${index + 1}`;
          const author =
            row['Author'] || row['author'] || row['Writer'] || 'Editorial Board';

          // Extract ISBN or auto-generate valid format
          const rawIsbn = row['ISBN'] || row['isbn'] || row['Isbn'] || row['Book ISBN'] || row['isbn13'] || '';
          const isbn = String(rawIsbn).trim() || generateRandomISBN();

          const typeRaw = String(row['Type'] || row['type'] || row['Production Type'] || 'POD').toUpperCase();
          const type = TYPES.includes(typeRaw) ? typeRaw : 'POD';
          const qty = Number(row['Quantity'] || row['qty'] || row['Qty'] || 1) || 1;

          // Determine Delivered By (Role)
          let deliveredBy = sheetDeliveredBy;
          if (!applyRoleToAll) {
            const rowRole = String(row['Delivered By'] || row['deliveredBy'] || row['Role'] || '').toUpperCase();
            if (ROLES.includes(rowRole)) deliveredBy = rowRole;
          }

          const status = row['Status'] || row['status'] || 'Delivered';

          // Determine Delivery Date: default to sheetDeliveryDate if applyTodayDate is checked
          let date = sheetDeliveryDate;
          if (!applyTodayDate) {
            date = row['Date'] || row['date'] || sheetDeliveryDate;
          }

          const time = row['Time'] || row['time'] || currentTime;
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
            deliveredBy,
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

  // Download Sample Excel Template with ISBN and Delivered By
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
        'Date': TODAY_STR,
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
        'Date': TODAY_STR,
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
        'Date': TODAY_STR,
        'Time': '02:00 PM',
        'Delivered By': 'TL',
        'Status': 'In Progress'
      },
      {
        'Delivery ID': 'DEL-2026-033',
        'Customer': 'Prime Publishers',
        'ISBN': '978-0-596-51774-8',
        'Title': 'Digital Typography & Layouts',
        'Author': 'Douglas Crockford',
        'Type': 'E-ISBN',
        'Quantity': 1,
        'Date': TODAY_STR,
        'Time': '03:45 PM',
        'Delivered By': 'MANAGER',
        'Status': 'Delivered'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery_Template');
    XLSX.writeFile(wb, 'Delivery_Production_Sample_Sheet.xlsx');
    if (showToast) showToast('Sample Excel template downloaded with ISBN and Role headers.');
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

  // Badge class helper for roles
  const getRoleStyle = (role, isSelected) => {
    switch (role) {
      case 'QC':
        return isSelected
          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100';
      case 'QAG':
        return isSelected
          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100';
      case 'TL':
        return isSelected
          ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/40'
          : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100';
      case 'MANAGER':
        return isSelected
          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
              <PackagePlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Add Production Delivery
              </h3>
              <p className="text-2xs text-slate-500">
                Record new deliveries with ISBN, role assignment (QC, QAG, TL, MANAGER) and today's dispatch timestamp
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
            <span>Manual Single Entry</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'sheet' ? (
            /* ========================================================================= */
            /* TAB 1: SHEET / EXCEL / CSV UPLOAD WITH ROLE ASSIGNMENT & ISBN PREVIEW     */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* TOP BAR: Role Assignment & Today's Delivery Configuration */}
              <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border border-blue-100/80 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Who is moving the sheet (QC, QAG, TL, MANAGER) */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Who is moving / delivering this sheet?
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Choose role to stamp all imported records (QC, QAG, TL, MANAGER)
                    </p>
                  </div>

                  {/* Role Selector Buttons */}
                  <div className="flex items-center space-x-1.5">
                    {ROLES.map((role) => {
                      const isSelected = sheetDeliveredBy === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleSelectSheetRole(role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${getRoleStyle(
                            role,
                            isSelected
                          )}`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Today's Delivery Option */}
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyTodayDate}
                        onChange={(e) => handleToggleApplyTodayDate(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Record as Today's Delivery:</span>
                      </span>
                    </label>

                    <input
                      type="text"
                      value={sheetDeliveryDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-blue-700 w-32 shadow-2xs"
                      title="Delivery Date for Imported Records"
                    />
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md">
                      Today
                    </span>
                  </div>

                  {/* Sample Template Download */}
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-300 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs hover:bg-blue-50/50 cursor-pointer shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download Sample Template</span>
                  </button>
                </div>
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
                        <span className="text-blue-600 font-extrabold">{uploadedFileName}</span>
                      ) : (
                        'Click to browse or drag & drop Excel / CSV file here'
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports .xlsx, .xls, and .csv files. Columns: Customer, ISBN, Title, Author, Type, Qty
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsed Preview Table with Prominent ISBN and Role */}
              {parsedRows.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">Preview Parsed Deliveries:</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-2xs rounded-full">
                        {parsedRows.length} Deliveries Ready
                      </span>
                      <span className="text-slate-400 text-2xs">|</span>
                      <span className="text-2xs text-slate-600 font-medium">
                        Moved by:{' '}
                        <span className="font-extrabold text-blue-700">{sheetDeliveredBy}</span>
                      </span>
                      <span className="text-slate-400 text-2xs">|</span>
                      <span className="text-2xs text-slate-600 font-medium">
                        Delivery Date:{' '}
                        <span className="font-extrabold text-slate-800">{sheetDeliveryDate}</span>
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

                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-2xs">
                      <thead className="bg-slate-100/90 text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 whitespace-nowrap">ISBN</th>
                          <th className="px-3 py-2">Title</th>
                          <th className="px-3 py-2">Customer</th>
                          <th className="px-3 py-2 text-center">Type</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-center whitespace-nowrap">Moved By (Role)</th>
                          <th className="px-3 py-2 whitespace-nowrap">Date</th>
                          <th className="px-3 py-2 text-center">Status</th>
                          <th className="px-2 py-2 text-center w-8">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {parsedRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            {/* Prominent ISBN column */}
                            <td className="px-3 py-2 font-mono font-bold text-blue-700 whitespace-nowrap">
                              {r.isbn}
                            </td>
                            {/* Book Title */}
                            <td className="px-3 py-2 font-semibold text-slate-900 truncate max-w-[170px]" title={r.title}>
                              {r.title}
                            </td>
                            {/* Customer */}
                            <td className="px-3 py-2 truncate max-w-[130px] font-medium text-slate-600">
                              {r.customer}
                            </td>
                            {/* Type */}
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-200">
                                {r.type}
                              </span>
                            </td>
                            {/* Qty */}
                            <td className="px-3 py-2 text-right font-bold text-slate-800">
                              {r.qty}
                            </td>
                            {/* Moved By (Role) with quick switcher */}
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              <select
                                value={r.deliveredBy}
                                onChange={(e) => handleRowRoleChange(i, e.target.value)}
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-800 cursor-pointer focus:ring-1 focus:ring-blue-500 outline-hidden"
                              >
                                {ROLES.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {/* Delivery Date */}
                            <td className="px-3 py-2 whitespace-nowrap text-slate-600 font-medium">
                              {r.date}
                            </td>
                            {/* Status */}
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {r.status}
                              </span>
                            </td>
                            {/* Action Remove */}
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(i)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* TAB 2: MANUAL SINGLE ENTRY FORM                                           */
            /* ========================================================================= */
            <form id="new-delivery-form" onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              {/* Who is moving / delivering selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Delivered By (Role) *</span>
                    <p className="text-[10px] text-slate-500">Select responsible team role</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {ROLES.map((role) => {
                    const isSelected = formData.deliveredBy === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveredBy: role })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${getRoleStyle(
                          role,
                          isSelected
                        )}`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

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

                {/* ISBN with Auto-generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                      <Hash className="w-3 h-3 text-blue-600" />
                      <span>ISBN *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isbn: generateRandomISBN() })}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="e.g. 978-0-13-235088-4"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono font-bold bg-white"
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

                {/* Delivery Date (Today) */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Delivery Date (Today)
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. 08 Sep 2026"
                    className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-semibold bg-white"
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
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="text-2xs text-slate-500 font-medium">
            {activeTab === 'single' ? (
              <span>
                Saving 1 delivery as <span className="font-bold text-blue-700">{formData.deliveredBy}</span> for{' '}
                <span className="font-bold text-slate-700">{formData.date}</span>
              </span>
            ) : (
              <span>
                {parsedRows.length > 0
                  ? `${parsedRows.length} deliveries ready to import as ${sheetDeliveredBy} for ${sheetDeliveryDate}`
                  : `Select Excel or CSV file to import as ${sheetDeliveredBy}`}
              </span>
            )}
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
                    ? `Import ${parsedRows.length} Deliveries (as ${sheetDeliveredBy})`
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

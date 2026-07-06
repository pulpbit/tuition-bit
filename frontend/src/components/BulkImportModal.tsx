import { useState, useRef } from 'react';
import { X, Upload, Download, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../lib/api';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; count: number } | null>(null);

  if (!isOpen) return null;

  const sample = `[
  { "name": "Ali Khan", "class_name": "10th", "school": "Delhi Public School", "board": "CBSE", "whatsapp": "+919876543210", "monthly_fee": 2000, "joining_date": "2026-01-15" },
  { "name": "Sara Ahmed", "class_name": "8th", "school": "St Mary's", "board": "ICSE", "whatsapp": "+919876543211", "monthly_fee": 1500, "joining_date": "2026-02-01" }
]`;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsText(file);
  };

  const handleImport = async () => {
    let students;
    try {
      students = JSON.parse(text);
      if (!Array.isArray(students)) throw new Error('Must be an array');
    } catch {
      alert('Invalid JSON. Check the format and try again.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/students/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ students }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Bulk Import Students</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {result ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-semibold text-slate-800">{result.message}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition text-slate-500 hover:text-primary-600">
                  <Upload className="w-5 h-5" />
                  Upload JSON file
                  <input ref={fileInputRef} type="file" accept=".json,.csv" onChange={handleFile} className="hidden" />
                </label>
                <button
                  onClick={() => { setText(sample); }}
                  className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-slate-600"
                >
                  <Download className="w-5 h-5" />
                  Sample
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={sample}
                rows={10}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Required fields:</strong> name, class_name, school, monthly_fee, joining_date</p>
                <p><strong>Optional:</strong> board, whatsapp</p>
                <p>You can also export from Excel/Sheets as CSV and convert to JSON.</p>
              </div>
            </>
          )}
        </div>

        {!result && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

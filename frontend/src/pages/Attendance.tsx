import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Calendar, Check, X } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Attendance() {
  const { getToken } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/attendance?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [date, getToken]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | null) => {
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, status } : s));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          records: students.map(s => ({ student_id: s.student_id, status: s.status }))
        })
      });
      if (res.ok) {
        alert('Attendance saved successfully');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Tracking</h2>
          <p className="text-slate-500 mt-1">Mark daily attendance for your students.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="border-none focus:ring-0 text-slate-700 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Class</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">No students found.</td></tr>
            ) : (
              students.map(s => (
                <tr key={s.student_id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4 text-slate-500">{s.class_name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                          onClick={() => handleStatusChange(s.student_id, 'present')}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition ${s.status === 'present' ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-400 border border-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                       >
                         <Check className="w-5 h-5" />
                       </button>
                       <button 
                          onClick={() => handleStatusChange(s.student_id, 'absent')}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition ${s.status === 'absent' ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-400 border border-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
                       >
                         <X className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {students.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button 
              onClick={saveAttendance} 
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

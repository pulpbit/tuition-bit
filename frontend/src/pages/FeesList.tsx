import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, IndianRupee } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function FeesList() {
  const { getToken } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFees(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PAID: { label: 'Paid', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
    PENDING: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
    OVERDUE: { label: 'Overdue', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: AlertCircle },
  };

  const totalDue = fees.reduce((sum, f) => sum + (f.pending_months * f.monthly_fee), 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.total_paid, 0);
  const overdueCount = fees.filter(f => f.status === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Fees & Payments</h2>
        <p className="text-slate-500 mt-1 text-sm">Track fee status for all enrolled students.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-full">
            <IndianRupee className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Total Collected</p>
            <p className="text-2xl font-bold text-slate-800">₹{totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-full">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Total Fee Due</p>
            <p className="text-2xl font-bold text-amber-600">₹{totalDue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-full">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Overdue Students</p>
            <p className="text-2xl font-bold text-rose-600">{overdueCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid (Months)</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Months Due</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading fee data...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No student data found.</td></tr>
              ) : (
                fees.map(f => {
                  const statusInfo = statusConfig[f.status] || statusConfig['PENDING'];
                  const Icon = statusInfo.icon;
                  return (
                    <tr key={f.student_id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <Link to={`/students/${f.student_id}`} className="font-medium text-slate-900 hover:text-primary-600 transition">
                          {f.name}
                        </Link>
                        <div className="text-xs text-slate-400">{f.class_name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">₹{f.monthly_fee}</td>
                      <td className="px-6 py-4 text-emerald-700 font-medium">{Math.floor(f.paid_months)}</td>
                      <td className="px-6 py-4 text-rose-600 font-medium">{f.pending_months}</td>
                      <td className="px-6 py-4 text-slate-700">₹{Number(f.total_paid).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          <Icon className="w-3 h-3" /> {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/students/${f.student_id}`}
                          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Add Payment →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

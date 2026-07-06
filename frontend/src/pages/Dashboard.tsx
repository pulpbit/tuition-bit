import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    feeCollected: 0,
    feeDue: 0,
    overdue: 0
  });
  const [pendingReminders, setPendingReminders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [metricsRes, remindersRes] = await Promise.all([
          fetch(`${API_URL}/api/metrics`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/reminders`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (metricsRes.ok) {
          setMetrics(await metricsRes.json());
        }
        if (remindersRes.ok) {
          const data = await remindersRes.json();
          setPendingReminders(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Welcome back, {user?.firstName} 👋</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Total Students</h3>
          <p className="text-3xl font-bold text-slate-800">
            {loading ? '...' : metrics.totalStudents}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Active Students</h3>
          <p className="text-3xl font-bold text-emerald-600">
            {loading ? '...' : metrics.activeStudents}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Collected (This Month)</h3>
          <p className="text-3xl font-bold text-primary-600">
            ₹{loading ? '...' : metrics.feeCollected}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Total Fee Due</h3>
          <p className="text-3xl font-bold text-amber-600">
            ₹{loading ? '...' : metrics.feeDue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Overdue Students</h3>
          <p className="text-3xl font-bold text-rose-600">
            {loading ? '...' : metrics.overdue}
          </p>
        </div>
        <Link
          to="/reminders"
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
        >
          <h3 className="text-slate-500 text-sm font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Pending Reminders
            </span>
          </h3>
          <p className="text-3xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            {loading ? '...' : pendingReminders}
          </p>
        </Link>
      </div>
    </div>
  );
}

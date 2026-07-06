import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Bell, Send, Loader2, Inbox } from 'lucide-react';
import { API_URL } from '../lib/api';
import ReminderCard from '../components/reminders/ReminderCard';
import SendAllModal from '../components/reminders/SendAllModal';

interface Reminder {
  id: string;
  student_name: string;
  whatsapp: string;
  message: string;
  reminder_number: number;
  created_at: string;
  status: string;
}

export default function Reminders() {
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendAllOpen, setSendAllOpen] = useState(false);

  const [token, setToken] = useState<string>('');

  useEffect(() => {
    getToken().then(t => { if (t) setToken(t); });
  }, [getToken]);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const t = await getToken();
      const res = await fetch(`${API_URL}/api/reminders`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        setReminders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fee Reminders</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Review and send payment reminders to parents.
          </p>
        </div>
        {reminders.length > 1 && (
          <button
            onClick={() => setSendAllOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
          >
            <Send className="w-4 h-4" />
            Send All
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          <span className="ml-2 text-slate-500">Loading reminders...</span>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No pending reminders</h3>
          <p className="text-sm text-slate-400">
            All fee reminders have been reviewed. New reminders are created daily at 9:00 AM.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bell className="w-4 h-4" />
            <span>{reminders.length} pending reminder{reminders.length !== 1 ? 's' : ''}</span>
          </div>
          {reminders.map((r) => (
            <ReminderCard key={r.id} reminder={r} token={token} onUpdate={fetchReminders} />
          ))}
        </div>
      )}

      {sendAllOpen && (
        <SendAllModal
          reminders={reminders}
          token={token}
          onClose={() => setSendAllOpen(false)}
          onComplete={fetchReminders}
        />
      )}
    </div>
  );
}

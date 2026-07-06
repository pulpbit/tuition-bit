import { useState } from 'react';
import { Send, XCircle, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { API_URL } from '../../lib/api';

interface Reminder {
  id: string;
  student_name: string;
  whatsapp: string;
  message: string;
  reminder_number: number;
  created_at: string;
  status: string;
}

interface ReminderCardProps {
  reminder: Reminder;
  token: string;
  onUpdate: () => void;
}

export default function ReminderCard({ reminder, token, onUpdate }: ReminderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sentLoading, setSentLoading] = useState(false);
  const [dismissLoading, setDismissLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSend = () => {
    const number = reminder.whatsapp?.replace(/[^0-9]/g, '') || '';
    if (!number) return;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(reminder.message)}`;
    window.open(url, '_blank');
    setShowConfirm(true);
  };

  const confirmSent = async () => {
    setSentLoading(true);
    try {
      await fetch(`${API_URL}/api/reminders/${reminder.id}/sent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSentLoading(false);
      setShowConfirm(false);
    }
  };

  const handleDismiss = async () => {
    setDismissLoading(true);
    try {
      await fetch(`${API_URL}/api/reminders/${reminder.id}/dismiss`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setDismissLoading(false);
    }
  };

  const date = new Date(reminder.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              reminder.reminder_number === 1 ? 'bg-amber-50' : 'bg-rose-50'
            }`}>
              <span className={`text-sm font-bold ${
                reminder.reminder_number === 1 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {reminder.reminder_number === 1 ? 'R1' : 'R2'}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{reminder.student_name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{date}</span>
                <span>·</span>
                <span className={reminder.reminder_number === 1 ? 'text-amber-600' : 'text-rose-600'}>
                  Reminder #{reminder.reminder_number}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {reminder.whatsapp && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-slate-400">WhatsApp:</span>
            <span>{reminder.whatsapp}</span>
          </div>
        )}

        {expanded && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-60 overflow-y-auto">
            {reminder.message}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSend}
            disabled={sentLoading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {sentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send via WhatsApp
          </button>
          <button
            onClick={handleDismiss}
            disabled={dismissLoading}
            className="flex items-center justify-center gap-2 px-3 py-2 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {dismissLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Dismiss
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-slate-800 font-medium">Did you send the message?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                No
              </button>
              <button
                onClick={confirmSent}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

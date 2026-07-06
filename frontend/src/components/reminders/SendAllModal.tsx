import { useState } from 'react';
import { X, Check, Send, Loader2 } from 'lucide-react';
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

interface SendAllModalProps {
  reminders: Reminder[];
  token: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function SendAllModal({ reminders, token, onClose, onComplete }: SendAllModalProps) {
  const [queue] = useState<Reminder[]>([...reminders]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = queue[currentIndex];

  const openCurrent = () => {
    if (!current) return;
    const number = current.whatsapp?.replace(/[^0-9]/g, '') || '';
    if (!number) return;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(current.message)}`;
    window.open(url, '_blank');
    setShowConfirm(true);
  };

  const handleYes = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/reminders/${current.id}/sent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    if (currentIndex < queue.length - 1) {
      setShowConfirm(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowConfirm(false);
      setCompleted(true);
      onComplete();
    }
  };

  const handleNo = () => {
    if (currentIndex < queue.length - 1) {
      setShowConfirm(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowConfirm(false);
      setCompleted(true);
      onComplete();
    }
  };

  const handleClose = () => {
    if (!completed && currentIndex > 0) {
      onComplete();
    }
    onClose();
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-slate-800">All reminders completed!</p>
          <p className="text-sm text-slate-500">
            Processed {queue.length} reminder{queue.length !== 1 ? 's' : ''}.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Send All Reminders</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Progress</span>
            <span>{currentIndex + 1} of {queue.length}</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
            />
          </div>

          {!showConfirm && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{current?.student_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                    Reminder #{current?.reminder_number}
                  </span>
                </div>
                {current?.whatsapp && (
                  <p className="text-sm text-slate-500">WhatsApp: {current.whatsapp}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={openCurrent}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                >
                  <Send className="w-4 h-4" />
                  Open WhatsApp
                </button>
                <button
                  onClick={handleNo}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {showConfirm && (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                ) : (
                  <Check className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <p className="text-slate-800 font-medium">Message sent?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleNo}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  No
                </button>
                <button
                  onClick={handleYes}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Yes'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-1.5">
            {queue.map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i < currentIndex
                    ? 'bg-emerald-100 text-emerald-700'
                    : i === currentIndex
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i < currentIndex ? <Check className="w-3 h-3" /> : i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

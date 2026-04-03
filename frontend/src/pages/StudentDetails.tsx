import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, User, Phone, CheckCircle, Clock, X } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function StudentDetails() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    billing_period: '',
    notes: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      const [studentRes, feesRes] = await Promise.all([
        fetch(`${API_URL}/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/students/${id}/fees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (studentRes.ok) setStudent(await studentRes.json());
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setPayments(feesData.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/students/${id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm)
      });
      if (res.ok) {
        setPaymentModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!student) return <div className="p-8 text-center text-rose-500">Student not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/students" className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Student Profile</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-12 h-12" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{student.name}</h3>
              <p className="text-slate-500">{student.class_name} • {student.school}</p>
              {student.board && <p className="text-slate-400 text-sm mt-1">Board: {student.board}</p>}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Parent / Guardian</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-800 font-medium">{student.parent_name || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Phone</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{student.parent_phone}</span>
                  </div>
                </div>
                {student.whatsapp && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">WhatsApp</p>
                    <div className="flex items-center gap-2 mt-1 text-slate-700">
                      {student.whatsapp}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-2 pt-4 mt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 -mx-8 -my-6 px-8 py-5">
              <div>
                <p className="text-sm font-medium text-slate-500">Monthly Fee</p>
                <p className="text-xl font-bold text-slate-800">₹{student.monthly_fee}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Joined On</p>
                <p className="text-slate-800 font-medium">{new Date(student.joining_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Payment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No payments recorded.</td>
                    </tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 text-slate-800 text-sm">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{p.billing_period}</td>
                        <td className="px-6 py-4 text-emerald-600 font-medium">₹{p.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
             <button onClick={() => {
                 setPaymentForm({ ...paymentForm, amount: student.monthly_fee });
                 setPaymentModalOpen(true);
               }} 
               className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
             >
               <CheckCircle className="w-5 h-5" /> Add Payment
             </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Fee Status</h3>
             <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
               <Clock className="w-6 h-6 text-amber-500" />
               <div>
                  <p className="font-semibold text-amber-900">Summary</p>
                  <p className="text-sm">Paid {payments.length} time(s).</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Record Payment</h2>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input required type="number" 
                  value={paymentForm.amount} 
                  onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Billing Period (e.g. October 2026)</label>
                <input required type="text"
                  value={paymentForm.billing_period} 
                  onChange={e => setPaymentForm({...paymentForm, billing_period: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-primary-700 transition">
                Save Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

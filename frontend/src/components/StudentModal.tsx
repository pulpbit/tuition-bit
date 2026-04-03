import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../lib/api';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: any;
}

export default function StudentModal({ isOpen, onClose, onSuccess, student }: StudentModalProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    class_name: '',
    school: '',
    board: '',
    parent_name: '',
    parent_phone: '',
    whatsapp: '',
    monthly_fee: 0,
    joining_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        name: '',
        class_name: '',
        school: '',
        board: '',
        parent_name: '',
        parent_phone: '',
        whatsapp: '',
        monthly_fee: 0,
        joining_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = await getToken();
      const url = student 
        ? `${API_URL}/api/students/${student.id}` 
        : `${API_URL}/api/students`;
        
      const res = await fetch(url, {
        method: student ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        console.error('Failed to save student');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class/Grade</label>
                <input required name="class_name" value={formData.class_name} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                <input required name="school" value={formData.school} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Education Board</label>
                <input name="board" value={formData.board} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name</label>
                <input required name="parent_name" value={formData.parent_name} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Phone</label>
                <input required name="parent_phone" value={formData.parent_phone} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                <input name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Fee (₹)</label>
                <input required type="number" name="monthly_fee" value={formData.monthly_fee} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                <input required type="date" name="joining_date" value={formData.joining_date} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition">
            Cancel
          </button>
          <button form="student-form" type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </div>
    </div>
  );
}

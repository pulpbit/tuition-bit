import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';
import StudentModal from '../components/StudentModal';

export default function StudentsList() {
  const { getToken } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Students</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your enrolled students and their details.</p>
        </div>
        <button 
          onClick={handleAddStudent}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No students found. Add one to get started.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/students/${student.id}`} className="font-medium text-slate-900 hover:text-primary-600 transition">
                        {student.name}
                      </Link>
                      <div className="text-sm text-slate-500">{student.school}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">{student.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">₹{student.monthly_fee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">{new Date(student.joining_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditStudent(student)} className="p-2 text-slate-400 hover:text-primary-600 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteStudent(student.id)} className="p-2 text-slate-400 hover:text-rose-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <StudentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStudents}
        student={selectedStudent}
      />
    </div>
  );
}

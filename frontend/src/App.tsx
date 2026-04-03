import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentDetails from './pages/StudentDetails';
import Attendance from './pages/Attendance';
import FeesList from './pages/FeesList';

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Tuition Bit</h1>
        <p className="text-md text-slate-500 mb-8">Manage your students, fees, and more.</p>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <SignedOut>
              <LandingPage />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        } />
        
        <Route element={
          <SignedIn>
            <DashboardLayout />
          </SignedIn>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/fees" element={<FeesList />} />
          <Route path="/attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

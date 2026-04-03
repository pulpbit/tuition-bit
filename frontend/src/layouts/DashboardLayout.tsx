import { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, CalendarCheck, Menu, X } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Fees', path: '/fees', icon: CreditCard },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
];

export default function DashboardLayout() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-lg flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:shadow-sm md:flex`}>
        
        {/* Logo + close button */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            Tuition Bit
          </h1>
          <button
            className="md:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col text-sm min-w-0">
              <span className="font-medium text-slate-700 truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-slate-400 text-xs truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between md:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            Tuition Bit
          </h1>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 flex md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

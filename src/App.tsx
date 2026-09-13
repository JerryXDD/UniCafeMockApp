import { useState } from 'react';
import StudentView from './pages/StudentView';
import StaffView from './pages/StaffView';
import AuthScreen from './pages/AuthScreen';
import { AuthProvider, useAuth } from './AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'student' | 'staff' | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user logged in and trying to access student view, show auth
  if (!user && role === 'student') {
    return <AuthScreen />;
  }

  // If user is logged in but hasn't selected role yet
  if (user && !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Campus Bites</h1>
          <p className="text-gray-500 max-w-sm">Welcome back, {user.displayName || 'Student'}!</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setRole('student')}
            className="w-full bg-white border-2 border-emerald-200 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-400 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 text-lg">Student</h3>
              <p className="text-sm text-gray-500">Browse menu, order & track</p>
            </div>
          </button>

          <button
            onClick={() => setRole('staff')}
            className="w-full bg-white border-2 border-purple-200 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-400 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 text-lg">Cafeteria Staff</h3>
              <p className="text-sm text-gray-500">Manage orders & menu</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Show role selection if not logged in
  if (!user && !role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Campus Bites</h1>
          <p className="text-gray-500 max-w-sm">University Cafeteria Pre-Order System — Skip the queue, order ahead!</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setRole('student')}
            className="w-full bg-white border-2 border-emerald-200 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-400 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 text-lg">Student</h3>
              <p className="text-sm text-gray-500">Login to browse, order & track</p>
            </div>
          </button>

          <button
            onClick={() => setRole('staff')}
            className="w-full bg-white border-2 border-purple-200 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-400 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 text-lg">Cafeteria Staff</h3>
              <p className="text-sm text-gray-500">Manage orders & menu</p>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 mb-2">💡 Demo Tip: Open in two tabs — one as Student (login), one as Staff — to see real-time sync!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {role === 'student' && user ? <StudentView onSwitchRole={() => setRole(null)} /> : <StaffView onSwitchRole={() => setRole(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

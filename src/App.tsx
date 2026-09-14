import { useState } from 'react';
import StudentView from './pages/StudentView';
import StaffView from './pages/StaffView';
import AuthScreen from './pages/AuthScreen';
import StaffAuth from './pages/StaffAuth';
import { AuthProvider, useAuth } from './AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<'student' | 'staff' | null>(null);
  const [staffAuthenticated, setStaffAuthenticated] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Student auth flow
  if (!user && role === 'student') {
    return <AuthScreen />;
  }

  // Staff auth flow
  if (!staffAuthenticated && role === 'staff') {
    return <StaffAuth onLogin={() => setStaffAuthenticated(true)} onBack={() => setRole(null)} />;
  }

  // Logged-in student, pick role
  if (user && !role) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Campus Bites</h1>
          <p className="text-gray-500 max-w-sm">Welcome back, {user.displayName || 'Student'}!</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setRole('student')}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-600 hover:bg-gray-900/80 transition-all group"
          >
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-900 rounded-2xl flex items-center justify-center group-hover:bg-emerald-900 transition-colors">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-100 text-lg">Student</h3>
              <p className="text-sm text-gray-500">Browse menu, order & track</p>
            </div>
          </button>

          <button
            onClick={() => setRole('staff')}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-600 hover:bg-gray-900/80 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-950 border border-purple-900 rounded-2xl flex items-center justify-center group-hover:bg-purple-900 transition-colors">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-100 text-lg">Cafeteria Staff</h3>
              <p className="text-sm text-gray-500">Manage orders & menu</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Not logged in, show role selection
  if (!user && !role) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Campus Bites</h1>
          <p className="text-gray-500 max-w-sm">University Cafeteria Pre-Order System — Skip the queue, order ahead!</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setRole('student')}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-600 hover:bg-gray-900/80 transition-all group"
          >
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-900 rounded-2xl flex items-center justify-center group-hover:bg-emerald-900 transition-colors">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-100 text-lg">Student</h3>
              <p className="text-sm text-gray-500">Login to browse, order & track</p>
            </div>
          </button>

          <button
            onClick={() => setRole('staff')}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-600 hover:bg-gray-900/80 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-950 border border-purple-900 rounded-2xl flex items-center justify-center group-hover:bg-purple-900 transition-colors">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-100 text-lg">Cafeteria Staff</h3>
              <p className="text-sm text-gray-500">Login with staff credentials</p>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 mb-2">💡 Demo Tip: Open in two tabs — one as Student, one as Staff — to see real-time sync!</p>
        </div>
      </div>
    );
  }

  const handleSwitchRole = () => {
    setRole(null);
    setStaffAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {role === 'student' && user ? (
        <StudentView onSwitchRole={handleSwitchRole} />
      ) : (
        <StaffView onSwitchRole={handleSwitchRole} />
      )}
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

import { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';

// Hardcoded staff credentials (demo only)
const STAFF_CREDENTIALS = {
  email: 'staff@campusbites.pk',
  password: 'campus123',
  name: 'Cafeteria Admin'
};

interface StaffAuthProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function StaffAuth({ onLogin, onBack }: StaffAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      if (email === STAFF_CREDENTIALS.email && password === STAFF_CREDENTIALS.password) {
        onLogin();
      } else {
        setError('Invalid staff credentials. Please try again.');
      }
      setLoading(false);
    }, 600);
  };

  const fillDemoCredentials = () => {
    setEmail(STAFF_CREDENTIALS.email);
    setPassword(STAFF_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👨‍🍳</div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Staff Login</h1>
        <p className="text-gray-500">Cafeteria Management Portal</p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Staff Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@campusbites.pk"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-900 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login as Staff'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-xl">
          <button
            onClick={fillDemoCredentials}
            className="w-full text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            🔑 Click to auto-fill demo credentials
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

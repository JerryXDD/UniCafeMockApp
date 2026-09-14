import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await signup(email, password, name);
      }
    } catch (err: any) {
      const message = err.message || 'Something went wrong';
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        setError('Invalid email or password');
      } else if (message.includes('email-already-in-use')) {
        setError('Email already registered. Please login instead.');
      } else if (message.includes('weak-password')) {
        setError('Password should be at least 6 characters');
      } else if (message.includes('invalid-email')) {
        setError('Invalid email address');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Campus Bites</h1>
        <p className="text-gray-500">University Cafeteria Pre-Order</p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6">
        <div className="flex mb-6 bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isLogin ? 'bg-gray-700 text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              !isLogin ? 'bg-gray-700 text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Ahmed Khan"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@uni.edu.pk"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
                minLength={6}
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
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {isLogin && (
          <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
            <p className="text-xs text-emerald-400/80">
              <strong>Demo:</strong> Don't have an account? Click "Sign Up" to create one. You'll get Rs. 2000 wallet balance to start!
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-600 text-center max-w-sm">
        Each student gets their own wallet, order history, and personalized experience.
      </p>
    </div>
  );
}

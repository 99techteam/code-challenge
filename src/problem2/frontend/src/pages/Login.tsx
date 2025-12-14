import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/balances');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-crypto-accent/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-linear-to-r from-crypto-accent to-indigo-400 bg-clip-text text-transparent">
            CryptoSwap
          </h1>
          <p className="text-gray-400 text-lg">Welcome back!</p>
        </div>

        <div className="bg-crypto-card rounded-3xl p-8 shadow-crypto-lg border border-crypto-cardHover">
          <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-crypto-darker rounded-xl px-4 py-3 text-white outline-none border border-crypto-cardHover hover:border-crypto-accent focus:border-crypto-accent transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-crypto-darker rounded-xl px-4 py-3 text-white outline-none border border-crypto-cardHover hover:border-crypto-accent focus:border-crypto-accent transition-colors"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-crypto-error/10 border border-crypto-error/30 rounded-xl">
                <p className="text-sm text-crypto-error flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crypto-accent hover:bg-crypto-accentHover text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-crypto-accent hover:text-crypto-accentHover transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Home Link */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              ← Back to Swap
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;

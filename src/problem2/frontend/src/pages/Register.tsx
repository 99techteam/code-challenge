import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password);
      navigate('/balances');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
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

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-linear-to-r from-crypto-accent to-indigo-400 bg-clip-text text-transparent">
            CryptoSwap
          </h1>
          <p className="text-gray-400 text-lg">Create your account</p>
        </div>

        <div className="bg-crypto-card rounded-3xl p-8 shadow-crypto-lg border border-crypto-cardHover">
          <h2 className="text-2xl font-bold text-white mb-6">Register</h2>

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

            {/* Username Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-crypto-darker rounded-xl px-4 py-3 text-white outline-none border border-crypto-cardHover hover:border-crypto-accent focus:border-crypto-accent transition-colors"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 6 characters)"
                className="w-full bg-crypto-darker rounded-xl px-4 py-3 text-white outline-none border border-crypto-cardHover hover:border-crypto-accent focus:border-crypto-accent transition-colors"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crypto-accent hover:bg-crypto-accentHover text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-crypto-accent hover:text-crypto-accentHover transition-colors"
              >
                Login here
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

export default Register;

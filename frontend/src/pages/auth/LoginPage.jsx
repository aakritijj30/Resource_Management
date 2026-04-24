import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../../components/ErrorMessage';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager/approvals');
      else navigate('/employee/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-shell relative flex min-h-screen w-full items-center justify-center bg-transparent overflow-hidden">
      
      {/* Dynamic Video Background */}
      <BackgroundVideo />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center p-4 pt-12"
      >
        <Link to="/" className="mb-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-600 transition-all hover:scale-110">
          <ArrowLeft size={16} />
          Back home
        </Link>


        {/* Circular Form Container */}
        <div className="relative flex aspect-square w-full max-w-[650px] flex-col items-center justify-center rounded-full bg-white/75 shadow-glow backdrop-blur-3xl border border-white/50 px-10 text-center">
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-sm">
                <LogIn size={26} strokeWidth={2} />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-surface-900">Welcome Back</h1>
            <p className="text-sm text-surface-500 mb-6 px-4">
              Enter your credentials to access your dashboard.
            </p>
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="w-full space-y-4 px-2"
          >
            <div>
              <input
                id="email"
                type="email"
                className="input text-center rounded-full"
                placeholder="Email Address"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input text-center rounded-full pr-12"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-surface-400 hover:text-primary-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="mx-auto w-full max-w-xs text-left">
                <ErrorMessage error={error} />
              </div>
            )}

            <button type="submit" className="btn-primary w-full rounded-full mt-2" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <div className="pt-2">
              <Link to="/signup" className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
                Need an account? Sign up
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkEmail, getDepartments } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../../components/ErrorMessage';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

const DEBOUNCE_MS = 350;
const EMAIL_DOMAIN = '@company.com';

const SELECT_CLS =
  "input appearance-none bg-no-repeat pr-10 text-center rounded-full " +
  "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] " +
  "bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center]";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
    department_id: '',
    manager_secret_key: '',
  });

  const [departments, setDepartments] = useState([]);
  const [deptsLoading, setDeptsLoading] = useState(true);

  const [checking, setChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [emailDomainError, setEmailDomainError] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    getDepartments()
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]))
      .finally(() => setDeptsLoading(false));
  }, []);

  const handleEmailChange = (val) => {
    setForm(f => ({ ...f, email: val }));
    if (val && !val.endsWith(EMAIL_DOMAIN)) {
      setEmailDomainError(true);
    } else {
      setEmailDomainError(false);
    }
  };

  useEffect(() => {
    if (!form.email || emailDomainError) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setChecking(true);
        const res = await checkEmail(form.email);
        setEmailAvailable(res.data.available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setChecking(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [form.email, emailDomainError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (emailDomainError || !form.email.endsWith(EMAIL_DOMAIN)) {
      setSubmitError(new Error(`Email must end with ${EMAIL_DOMAIN}`));
      return;
    }

    if (emailAvailable === false) {
      setSubmitError(new Error('This email already exists. Please sign in instead.'));
      return;
    }

    if (!form.department_id) {
      setSubmitError(new Error('Please select a department.'));
      return;
    }

    setLoading(true);
    try {
      const userData = await signup({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        department_id: Number(form.department_id),
        manager_secret_key: form.role === 'manager' ? form.manager_secret_key : null,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setLoading(false);
    }
  };

  const emailStatusMsg = emailDomainError
    ? `Must end with ${EMAIL_DOMAIN}`
    : checking
      ? 'Checking availability...'
      : emailAvailable === false
        ? 'Email already in use.'
        : emailAvailable === true
          ? 'Email is available'
          : `Use ${EMAIL_DOMAIN}`;

  const emailStatusColor = emailDomainError || emailAvailable === false
    ? 'text-rose-500'
    : emailAvailable === true
      ? 'text-emerald-500'
      : 'text-surface-400';

  return (
    <div className="public-shell relative flex min-h-screen w-full items-center justify-center bg-transparent py-8 overflow-hidden">
      
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

        {/* Form Container */}
        <div className="relative flex w-full max-w-[600px] flex-col items-center justify-center rounded-[3.5rem] bg-white/75 shadow-glow backdrop-blur-3xl border border-white/50 px-10 py-12 text-center">
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-sm">
                <UserPlus size={26} strokeWidth={2} />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-surface-900 mb-6">Create Account</h1>
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="w-full space-y-3"
          >
            <div>
              <input
                id="full_name"
                className="input text-center rounded-full"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Full Name"
                required
              />
            </div>

            <div>
              <input
                id="signup-email"
                type="email"
                className={`input text-center rounded-full ${emailDomainError ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' : ''}`}
                value={form.email}
                onChange={e => handleEmailChange(e.target.value)}
                placeholder={`Email (${EMAIL_DOMAIN})`}
                required
              />
              <div className="mt-1 text-xs">
                <span className={emailStatusColor}>{emailStatusMsg}</span>
              </div>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input text-center rounded-full pr-12"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Password (Min. 8 chars)"
                minLength={6}
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

            <div className="grid grid-cols-2 gap-3">
              <select
                id="role"
                className={SELECT_CLS}
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>

              <select
                id="department_id"
                className={SELECT_CLS}
                value={form.department_id}
                onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                required
                disabled={deptsLoading}
              >
                <option value="">{deptsLoading ? 'Loading...' : 'Dept'}</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {form.role === 'manager' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative"
              >
                <input
                  id="manager_secret_key"
                  type={showSecret ? "text" : "password"}
                  className="input text-center rounded-full mt-1 pr-12"
                  value={form.manager_secret_key}
                  onChange={e => setForm(f => ({ ...f, manager_secret_key: e.target.value }))}
                  placeholder="Manager Secret Key"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-surface-400 hover:text-primary-600 transition-colors mt-0.5"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </motion.div>
            )}

            {submitError && (
              <div className="mx-auto w-full max-w-xs text-left text-sm pt-2">
                <ErrorMessage error={submitError} />
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 text-center">
                Account created! Redirecting...
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full rounded-full mt-4"
              disabled={loading || emailAvailable === false || emailDomainError || !form.department_id}
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
            
            <div className="pt-2">
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
                Already have an account? Sign In
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

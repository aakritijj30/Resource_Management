import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkEmail, getDepartments } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ErrorMessage'
import PublicNav from '../../components/PublicNav'

const DEBOUNCE_MS = 350
const EMAIL_DOMAIN = '@relanto.ai'
const EMAIL_REGEX = /^[a-z]+\.[a-z0-9]+@relanto\.ai$/
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?/]).{8,}$/

const SELECT_CLS =
  "input appearance-none bg-no-repeat pr-10 " +
  "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] " +
  "bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center]"

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
    department_id: '',
    manager_secret_key: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [departments, setDepartments] = useState([])
  const [deptsLoading, setDeptsLoading] = useState(true)

  const [checking, setChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [emailFormatError, setEmailFormatError] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch departments on mount
  useEffect(() => {
    getDepartments()
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]))
      .finally(() => setDeptsLoading(false))
  }, [])

  // Email validation
  const handleEmailChange = (val) => {
    const lower = val.toLowerCase()
    setForm(f => ({ ...f, email: lower }))
    if (lower && !EMAIL_REGEX.test(lower)) {
      setEmailFormatError(true)
    } else {
      setEmailFormatError(false)
    }
  }

  // Check availability
  useEffect(() => {
    if (!form.email || emailFormatError) {
      setEmailAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setChecking(true)
        const res = await checkEmail(form.email)
        setEmailAvailable(res.data.available)
      } catch {
        setEmailAvailable(null)
      } finally {
        setChecking(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [form.email, emailFormatError])

  const validatePassword = (pass) => {
    return PASS_REGEX.test(pass)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (emailFormatError) {
      setSubmitError(new Error('Email must follow the pattern name.name1@relanto.ai'))
      return
    }

    if (!validatePassword(form.password)) {
      setSubmitError(new Error('Password must be 8+ chars with uppercase, lowercase, number, and special char.'))
      return
    }

    if (emailAvailable === false) {
      setSubmitError(new Error('This email already exists.'))
      return
    }

    if (!form.department_id) {
      setSubmitError(new Error('Please select a department.'))
      return
    }

    setLoading(true)
    try {
      const userData = await signup({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        department_id: Number(form.department_id),
        manager_secret_key: form.role === 'manager' ? form.manager_secret_key : null,
      })
      setSuccess(true)
      setTimeout(() => navigate(`/${userData.role}/dashboard`), 600)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setLoading(false)
    }
  }

  const emailStatusMsg = emailFormatError
    ? 'Pattern must be name.name1@relanto.ai'
    : checking
      ? 'Checking availability...'
      : emailAvailable === false
        ? 'Account already exists.'
        : emailAvailable === true
          ? 'Email is valid and available.'
          : 'Use name.name1@relanto.ai'

  const emailStatusColor = emailFormatError || emailAvailable === false
    ? 'text-rose-600'
    : emailAvailable === true
      ? 'text-emerald-600'
      : 'text-slate-400'

  return (
    <div className="public-shell px-4 py-6 sm:px-6 lg:px-8">
      <PublicNav />
      <div className="public-panel mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-shell hero-panel relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(250,204,21,0.16),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.12),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.42))]" />
          <div className="absolute right-12 top-12 h-28 w-28 rounded-full bg-accent-100/60 blur-2xl animate-drift" />
          <div className="absolute left-10 bottom-10 h-24 w-24 rounded-full bg-primary-100/60 blur-2xl animate-drift" />
          <div className="relative z-10 space-y-6">
            <div className="page-kicker">Create account</div>
            <h1 className="page-title">Join the booking workspace</h1>
            <p className="page-copy">
              Sign up as an employee or manager, select your department, and get routed into your personal dashboard immediately.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="soft-panel motion-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Department scoped</p>
                <p className="mt-2 text-sm text-slate-600">Resources are shown based on your department and shared common resources.</p>
              </div>
              <div className="soft-panel motion-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Secure access</p>
                <p className="mt-2 text-sm text-slate-600">Only @company.com emails allowed. Manager accounts require a secret key.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/" className="btn-secondary">Back to home</Link>
              <Link to="/login" className="btn-primary">Sign in</Link>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="card mx-auto max-w-md motion-card">
            <div className="mb-8">
              <p className="page-kicker">Join the team</p>
              <h2 className="mt-4 text-2xl font-display font-semibold text-slate-900">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose your role and department to get started. Admin accounts are managed internally.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="label" htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  className="input"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>

              {/* Email with validation */}
              <div>
                <label className="label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className={`input ${emailFormatError ? 'border-rose-400 focus:ring-rose-300' : ''}`}
                  value={form.email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder="name.name1@relanto.ai"
                  required
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={emailStatusColor}>{emailStatusMsg}</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input pr-12"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  8+ chars, uppercase, lowercase, number & special character.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="label" htmlFor="role">Role</label>
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
              </div>

              {/* Manager secret key (conditional) */}
              {form.role === 'manager' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="label" htmlFor="manager_secret_key">Manager Secret Key</label>
                  <input
                    id="manager_secret_key"
                    type="password"
                    className="input"
                    value={form.manager_secret_key}
                    onChange={e => setForm(f => ({ ...f, manager_secret_key: e.target.value }))}
                    placeholder="Enter secret key"
                    required
                  />
                </div>
              )}

              {/* Department */}
              <div>
                <label className="label" htmlFor="department_id">Department</label>
                <select
                  id="department_id"
                  className={SELECT_CLS}
                  value={form.department_id}
                  onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                  required
                  disabled={deptsLoading}
                >
                  <option value="">{deptsLoading ? 'Loading departments...' : '— Select department —'}</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <ErrorMessage error={submitError} />

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Account created! Redirecting to your dashboard...
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading || emailAvailable === false || emailDomainError || !form.department_id}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

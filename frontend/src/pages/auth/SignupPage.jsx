import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkEmail, getDepartments } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ErrorMessage'
import PublicNav from '../../components/PublicNav'

const DEBOUNCE_MS = 350
const EMAIL_DOMAIN = '@company.com'

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

  const [departments, setDepartments] = useState([])
  const [deptsLoading, setDeptsLoading] = useState(true)

  const [checking, setChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [emailDomainError, setEmailDomainError] = useState(false)
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

  // Email domain validation
  const handleEmailChange = (val) => {
    setForm(f => ({ ...f, email: val }))
    if (val && !val.endsWith(EMAIL_DOMAIN)) {
      setEmailDomainError(true)
    } else {
      setEmailDomainError(false)
    }
  }

  // Check availability (debounced, only if domain is valid)
  useEffect(() => {
    if (!form.email || emailDomainError) {
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
  }, [form.email, emailDomainError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (emailDomainError || !form.email.endsWith(EMAIL_DOMAIN)) {
      setSubmitError(new Error(`Email must end with ${EMAIL_DOMAIN}`))
      return
    }

    if (emailAvailable === false) {
      setSubmitError(new Error('This email already exists. Please sign in instead.'))
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

  const emailStatusMsg = emailDomainError
    ? `Email must end with ${EMAIL_DOMAIN}`
    : checking
      ? 'Checking availability...'
      : emailAvailable === false
        ? 'This email already has an account.'
        : emailAvailable === true
          ? 'Email is available.'
          : `Use your company email (e.g. name${EMAIL_DOMAIN})`

  const emailStatusColor = emailDomainError || emailAvailable === false
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

              {/* Email with @company.com validation */}
              <div>
                <label className="label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className={`input ${emailDomainError ? 'border-rose-400 focus:ring-rose-300' : ''}`}
                  value={form.email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder={`name${EMAIL_DOMAIN}`}
                  required
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={emailStatusColor}>{emailStatusMsg}</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  minLength={6}
                  required
                />
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

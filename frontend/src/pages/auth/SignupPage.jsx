import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkEmail } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ErrorMessage'
import PublicNav from '../../components/PublicNav'

const DEBOUNCE_MS = 350

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    department_id: '',
  })
  const [checking, setChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!form.email) {
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
  }, [form.email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (emailAvailable === false) {
      setSubmitError(new Error('This email already exists. Please sign in instead.'))
      return
    }

    setLoading(true)
    try {
      await signup({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        department_id: form.department_id ? Number(form.department_id) : null,
      })
      setSuccess(true)
      setTimeout(() => navigate('/employee/dashboard'), 600)
    } catch (err) {
      setSubmitError(err)
    } finally {
      setLoading(false)
    }
  }

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
              Sign up as an employee, check availability before registering, and get routed into your personal dashboard immediately.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="soft-panel motion-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Duplicate protection</p>
                <p className="mt-2 text-sm text-slate-600">Existing emails are blocked before signup and again on submit.</p>
              </div>
              <div className="soft-panel motion-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Responsive UI</p>
                <p className="mt-2 text-sm text-slate-600">The form scales cleanly on mobile, tablet, and desktop.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/" className="btn-secondary">
                Back to home
              </Link>
              <Link to="/login" className="btn-primary">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="card mx-auto max-w-md motion-card">
            <div className="mb-8">
              <p className="page-kicker">Employee signup</p>
              <h2 className="mt-4 text-2xl font-display font-semibold text-slate-900">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                New users are created as employees. Managers and admins are set up from the admin side.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  required
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={emailAvailable === false ? 'text-rose-600' : 'text-slate-400'}>
                    {checking
                      ? 'Checking availability...'
                      : emailAvailable === false
                        ? 'This email already has an account.'
                        : emailAvailable === true
                          ? 'Email available.'
                          : 'We will check this email automatically.'}
                  </span>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="********"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="department_id">Department ID</label>
                <input
                  id="department_id"
                  type="number"
                  className="input"
                  value={form.department_id}
                  onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <ErrorMessage error={submitError} />

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Account created successfully. Redirecting to your dashboard...
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading || emailAvailable === false}
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

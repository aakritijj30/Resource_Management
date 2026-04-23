import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ErrorMessage'
import PublicNav from '../../components/PublicNav'

const FEATURES = [
  'Secure sign in for employees, managers, and admins',
  'Live conflict checks before booking requests go out',
  'Role-based dashboards that match your job',
]

const DEMOS = [
  ['alice.admin@relanto.ai', 'd+e(11Yp51D1'],
  ['bob.manager@relanto.ai', 's1+Qq-5evOKH'],
  ['dave.employee@relanto.ai', '1AZ2yNE3U@po'],
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'manager') navigate('/manager/approvals')
      else navigate('/employee/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-shell px-4 py-6 sm:px-6 lg:px-8">
      <PublicNav />
      <div className="public-panel mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="hero-panel relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-glow backdrop-blur-xl sm:p-10 lg:p-12 animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.85),rgba(255,255,255,0.4))]" />
          <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-accent-100/70 blur-2xl animate-drift" />
          <div className="absolute left-8 bottom-8 h-20 w-20 rounded-full bg-primary-100/60 blur-2xl animate-drift" />
          <div className="relative z-10 flex flex-col gap-8">
            <div className="space-y-5">
              <div className="page-kicker">Sign in</div>
              <h1 className="page-title">Enter the resource management workspace</h1>
              <p className="page-copy">
                Use your company account to open the dashboard that matches your role and permissions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {FEATURES.map(feature => (
                <div key={feature} className="soft-panel motion-card p-4">
                  <div className="mb-3 h-9 w-9 rounded-xl bg-primary-500/15" />
                  <p className="text-sm leading-6 text-slate-600">{feature}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/" className="btn-secondary">
                Back to home
              </Link>
              <Link to="/signup" className="btn-primary">
                Create account
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="card mx-auto max-w-md motion-card">
            <div className="mb-8">
              <p className="page-kicker">Workspace login</p>
              <h2 className="mt-4 text-2xl font-display font-semibold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Access your employee, manager, or admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="name.name1@relanto.ai"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input pr-12"
                    placeholder="********"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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
              </div>

              <ErrorMessage error={error} />

              <button id="btn-login" type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Need an account?</span>
              <Link to="/signup" className="font-medium text-primary-700 hover:text-primary-800">
                Sign up
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Demo credentials</p>
              <div className="mt-3 space-y-2">
                {DEMOS.map(([email, password]) => (
                  <div key={email} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 shadow-sm">
                    <span>{email}</span>
                    <span className="text-slate-400">{password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

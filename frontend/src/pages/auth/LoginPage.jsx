import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ErrorMessage from '../../components/ErrorMessage'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin')   navigate('/admin')
      else if (user.role === 'manager') navigate('/manager/approvals')
      else navigate('/employee/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* Background gradient orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4 text-2xl shadow-lg shadow-primary-600/30">
            ⚡
          </div>
          <h1 className="text-3xl font-bold">BookSpace</h1>
          <p className="text-white/40 mt-1">Enterprise Resource Booking System</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <ErrorMessage error={error} />

            <button id="btn-login" type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-xs text-white/30 mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs text-white/50">
              <div>👤 admin@company.com / admin123</div>
              <div>✅ mgr.eng@company.com / manager123</div>
              <div>📅 emp1@company.com / emp123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import PublicNav from '../../components/PublicNav'

const FEATURES = [
  {
    title: 'Employee booking flow',
    text: 'Search resources, request time, and track approval states with clarity.',
  },
  {
    title: 'Manager oversight',
    text: 'Review pending requests and manage approvals from a dedicated queue.',
  },
  {
    title: 'Admin operations',
    text: 'Control resources, policies, maintenance, and analytics from one place.',
  },
]

const STATS = [
  { value: '3', label: 'Roles supported' },
  { value: '24/7', label: 'Shared visibility' },
  { value: '1', label: 'Unified workflow' },
]

export default function HomePage() {
  return (
    <div className="public-shell">
      <PublicNav />

      <header className="public-panel mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="hero-panel overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-glow backdrop-blur-xl animate-fade-in">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(250,204,21,0.10),rgba(255,255,255,0)_35%,rgba(34,211,238,0.08))]" />
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
            <div className="relative space-y-6 animate-slide-in">
              <div className="page-kicker shadow-sm">Resource management suite</div>
              <div className="space-y-4">
                <h1 className="page-title max-w-3xl text-4xl sm:text-5xl">
                  Run bookings, approvals, and resource control from one clean workspace.
                </h1>
                <p className="page-copy text-base">
                  Built for employees, managers, and admins who need a reliable system for scheduling, governance, and audit-friendly oversight.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/login" className="btn-primary">
                  Sign in
                </Link>
                <Link to="/signup" className="btn-secondary">
                  Create account
                </Link>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <div className="soft-panel motion-card px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Bookings</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Fast request flow</p>
                </div>
                <div className="soft-panel motion-card px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Approvals</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Manager review</p>
                </div>
                <div className="soft-panel motion-card px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Reports</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">Live visibility</p>
                </div>
              </div>
            </div>

            <aside className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-accent-50 p-5 animate-rise">
              <div className="soft-panel p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Today&apos;s focus</p>
                <p className="mt-2 text-xl font-display font-semibold text-slate-900">Bookings, approvals, and visibility</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Move from the public landing page into login or signup, then land in the right dashboard for your role.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {STATS.map(stat => (
                  <div key={stat.label} className="soft-panel motion-card p-4">
                    <div className="text-2xl font-display font-semibold text-slate-900">{stat.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </header>

      <main className="public-panel mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-3">
          {FEATURES.map(feature => (
            <article key={feature.title} className="section-shell motion-card animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="section-shell hero-panel">
            <div className="space-y-4">
              <div className="page-kicker">How it works</div>
              <h2 className="page-title text-2xl">Start on the home page, then move into the authenticated workspace</h2>
              <p className="page-copy">
                The public experience is a clear front door with a header, body, and footer. Once signed in, users move to their role-specific dashboard with the app sidebar.
              </p>
            </div>
          </article>

          <aside className="section-shell motion-card">
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-slate-900">Quick access</h2>
              <div className="grid gap-3">
                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:bg-accent-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:bg-accent-50"
                >
                  Signup
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <footer className="public-panel mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/85 px-6 py-5 text-sm text-slate-500 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-slate-800">Enterprise booking system for resource management.</p>
            <p className="mt-1">Designed to keep the landing experience separate from the authenticated app.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">Bookings</span>
            <span className="chip">Approvals</span>
            <span className="chip">Reports</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

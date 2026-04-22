import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    title: 'Live Field Health',
    description: 'Track growth stage and computed risk status in one clean operational view.',
    icon: '📈',
  },
  {
    title: 'Agent Coordination',
    description: 'Assign fields to agents and keep updates flowing without spreadsheet overhead.',
    icon: '🤝',
  },
  {
    title: 'Actionable Dashboard',
    description: 'Get instant totals, status breakdowns, and recent activity for fast decisions.',
    icon: '🎯',
  },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(34,197,94,0.25),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.2),transparent_35%),linear-gradient(to_bottom,#020617,#0f172a)]" />
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-300">
              SmartSeason Field Monitoring
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Manage field operations with clarity, not chaos.
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              SmartSeason helps agriculture teams monitor crop progress, coordinate agents, and
              spot risks early. Built for everyday workflow, not dashboard theater.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Sign In
                </Link>
              )}
              <a
                href="#features"
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <p className="text-2xl">{feature.icon}</p>
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

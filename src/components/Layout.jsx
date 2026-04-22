import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="relative isolate min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.12),transparent_35%)]" />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

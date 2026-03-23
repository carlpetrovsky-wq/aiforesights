'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Rss,
  Wrench,
  Users,
  Megaphone,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/articles',    label: 'Articles',    icon: FileText },
  { href: '/admin/sources',     label: 'RSS Sources', icon: Rss },
  { href: '/admin/tools',       label: 'Tools',       icon: Wrench },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Users },
  { href: '/admin/ads',         label: 'Ad Slots',    icon: Megaphone },
  { href: '/admin/settings',    label: 'Settings',    icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Don't wrap the login page with the admin layout
  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/[0.06]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img src="/logo-icon-64.png" alt="AI Foresights" className="w-8 h-8 rounded-lg" />
          <div>
            <span className="text-sm font-semibold text-white">AI Foresights</span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-medium">Admin</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${active
                  ? 'bg-brand-sky/10 text-brand-sky'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-brand-sky' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-brand-sky/50" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition"
        >
          <ExternalLink className="w-4 h-4" />
          View Site
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-brand-navy border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <img src="/logo-icon-64.png" alt="AI Foresights" className="w-7 h-7 rounded-md" />
          <span className="text-sm font-semibold text-white">Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white p-1">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-brand-navy border-r border-white/[0.06] flex flex-col z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-brand-navy border-r border-white/[0.06] flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

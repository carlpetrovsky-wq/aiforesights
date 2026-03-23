'use client'

import { X } from 'lucide-react'
import { ReactNode } from 'react'

/* ─── Modal ─────────────────────────────────────────── */
export function AdminModal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[80vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition p-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

/* ─── Form Field ────────────────────────────────────── */
export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  )
}

/* ─── Input ─────────────────────────────────────────── */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white
        placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 focus:border-brand-sky/30 transition
        ${props.className ?? ''}`}
    />
  )
}

/* ─── Textarea ──────────────────────────────────────── */
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white
        placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-sky/30 focus:border-brand-sky/30 transition resize-y
        ${props.className ?? ''}`}
    />
  )
}

/* ─── Select ────────────────────────────────────────── */
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 bg-slate-800 border border-white/[0.08] rounded-lg text-sm text-white
        focus:outline-none focus:ring-2 focus:ring-brand-sky/30 focus:border-brand-sky/30 transition
        [&>option]:bg-slate-800 [&>option]:text-white
        ${props.className ?? ''}`}
    >
      {props.children}
    </select>
  )
}

/* ─── Status Badge ──────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    archived: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-md border ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  )
}

/* ─── Toggle ────────────────────────────────────────── */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
          ${checked ? 'bg-brand-sky' : 'bg-white/10'}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`}
        />
      </button>
      <span className="text-sm text-slate-400">{label}</span>
    </label>
  )
}

/* ─── Save Button ───────────────────────────────────── */
export function SaveButton({
  onClick,
  loading,
  label = 'Save',
}: {
  onClick: () => void
  loading: boolean
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-5 py-2 bg-brand-sky hover:bg-brand-skyDark disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
    >
      {loading ? 'Saving…' : label}
    </button>
  )
}

/* ─── Delete Button ─────────────────────────────────── */
export function DeleteButton({
  onClick,
  loading,
}: {
  onClick: () => void
  loading: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium rounded-lg border border-red-500/20 transition"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}

/* ─── Empty State ───────────────────────────────────── */
export function EmptyState({ message, icon: Icon }: { message: string; icon?: any }) {
  return (
    <div className="text-center py-16 text-slate-500">
      {Icon && <Icon className="w-10 h-10 mx-auto mb-3 text-slate-600" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}

/* ─── Page Header ───────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

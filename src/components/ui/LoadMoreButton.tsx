interface LoadMoreButtonProps {
  onClick: () => void
  loading: boolean
  hasMore: boolean
}

export default function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null
  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-8 py-2.5 rounded-lg bg-brand-sky text-white text-sm font-semibold hover:bg-brand-skyDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
      >
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  )
}

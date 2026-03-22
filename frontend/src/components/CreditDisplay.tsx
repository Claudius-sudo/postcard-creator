import { useAuth } from '../context/AuthContext'

interface CreditDisplayProps {
  showLabel?: boolean
  className?: string
}

export function CreditDisplay({ showLabel = false, className = '' }: CreditDisplayProps) {
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated || !currentUser) {
    return null
  }

  const credits = currentUser.credits
  const maxCredits = 100 // Assuming max is 100 for progress calculation
  const percentage = Math.min((credits / maxCredits) * 100, 100)
  
  // Determine color based on credits
  let statusColor = 'bg-emerald-500'
  if (credits < 10) statusColor = 'bg-red-500'
  else if (credits < 30) statusColor = 'bg-amber-500'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-xs text-cream-500 hidden sm:inline">Credits</span>
      )}
      
      <div className="flex items-center gap-2 bg-cream-100/80 rounded-full px-3 py-1.5">
        {/* Coin icon */}
        <div className="relative">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
        
        {/* Credit count */}
        <span className={`text-sm font-semibold ${
          credits < 10 ? 'text-red-600' : 'text-cream-700'
        }`}>
          {credits}
        </span>
        
        {/* Mini progress bar */}
        <div className="hidden sm:block w-12 h-1.5 bg-cream-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${statusColor} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {/* Low credit warning */}
      {credits < 10 && (
        <span className="text-xs text-red-500 font-medium hidden md:inline">
          Low!
        </span>
      )}
    </div>
  )
}

// Compact version for tight spaces
export function CreditBadge({ className = '' }: { className?: string }) {
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated || !currentUser) {
    return null
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium ${className}`}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      {currentUser.credits}
    </div>
  )
}

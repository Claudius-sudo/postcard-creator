import { useAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireCredits?: number
}

export function ProtectedRoute({ children, requireCredits = 0 }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to home with return path
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (requireCredits > 0 && currentUser && currentUser.credits < requireCredits) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-warm border border-cream-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-terracotta-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-semibold text-cream-900 mb-2">
            Insufficient Credits
          </h2>
          <p className="text-cream-600 mb-6">
            You need {requireCredits} credits to use this feature. You currently have {currentUser?.credits || 0} credits.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.href = '#gallery'}
              className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-cream-700 rounded-lg transition-colors"
            >
              Go to Gallery
            </button>
            <button
              onClick={() => window.location.href = '/credits'}
              className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg transition-colors"
            >
              Get Credits
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Credit balance indicator */}
      {currentUser && (
        <div className="fixed top-20 right-4 z-40 bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-soft border border-cream-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-cream-700">
              {currentUser.credits} credits
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

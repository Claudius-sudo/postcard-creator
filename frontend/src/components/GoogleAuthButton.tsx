import { useAuth } from '../context/AuthContext'
import { CreditDisplay } from './CreditDisplay'

interface GoogleAuthButtonProps {
  className?: string
}

export function GoogleAuthButton({ className = '' }: GoogleAuthButtonProps) {
  const { isAuthenticated, currentUser, logout } = useAuth()

  const handleLogin = () => {
    // Trigger Google OAuth popup
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'
    const redirectUri = `${window.location.origin}/auth/callback`
    const scope = 'email profile openid'
    const state = Math.random().toString(36).substring(7)
    
    // Store state for verification
    sessionStorage.setItem('oauth_state', state)
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token id_token&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `nonce=${Math.random().toString(36).substring(7)}`
    
    // Open popup for OAuth
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const popup = window.open(
      authUrl,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    )
    
    // Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { user, token } = event.data
        const { login } = useAuth()
        login(user, token)
        popup?.close()
      }
      
      if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('Google auth error:', event.data.error)
        popup?.close()
      }
      
      window.removeEventListener('message', handleMessage)
    }
    
    window.addEventListener('message', handleMessage)
  }

  if (isAuthenticated && currentUser) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <CreditDisplay />
        <div className="flex items-center gap-2 pl-3 border-l border-cream-200">
          <img
            src={currentUser.picture}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full border-2 border-cream-200"
          />
          <span className="hidden sm:block text-sm font-medium text-cream-700">
            {currentUser.name}
          </span>
          <button
            onClick={logout}
            className="ml-2 p-1.5 text-cream-500 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className={`
        flex items-center gap-2 px-4 py-2 
        bg-white hover:bg-cream-50 
        border border-cream-200 hover:border-terracotta-300
        text-cream-800 text-sm font-medium 
        rounded-xl transition-all duration-200
        shadow-soft hover:shadow-warm
        ${className}
      `}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  )
}

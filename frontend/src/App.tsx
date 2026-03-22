import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/Header'
import { SinglePage } from './components/SinglePage'
import { GalleryPage } from './pages/GalleryPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'

type Page = 'home' | 'gallery'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page
      if (['home', 'gallery'].includes(hash)) {
        setCurrentPage(hash)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (page: Page) => {
    window.location.hash = page
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header 
        onNavigate={(page) => navigate(page as Page)} 
        currentPage={currentPage} 
      />
      
      <main>
        {currentPage === 'home' && (
          <SinglePage />
        )}
        {currentPage === 'gallery' && (
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App

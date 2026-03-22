import { useState, useEffect } from 'react'
import axios from 'axios'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { CreatePage } from './pages/CreatePage'
import { GalleryPage } from './pages/GalleryPage'
import type { PostcardTemplate, PostcardDesign, Postcard } from './types'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type Page = 'home' | 'create' | 'gallery'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedTemplate, setSelectedTemplate] = useState<PostcardTemplate | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page
      if (['home', 'create', 'gallery'].includes(hash)) {
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

  const handleSelectTemplate = (template: PostcardTemplate) => {
    setSelectedTemplate(template)
  }

  const handleSavePostcard = async (design: PostcardDesign) => {
    if (!design.title.trim()) {
      alert('Please add a title to your postcard')
      return
    }

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', design.title)
      formData.append('message', design.message)
      formData.append('recipient_email', '')
      
      // Convert base64 image to file if exists
      if (design.image) {
        const response = await fetch(design.image)
        const blob = await response.blob()
        const file = new File([blob], 'postcard-image.png', { type: 'image/png' })
        formData.append('image', file)
      }

      await axios.post(`${API_URL}/postcards`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      alert('Postcard saved successfully!')
      navigate('gallery')
    } catch (err) {
      console.error('Failed to save postcard:', err)
      alert('Failed to save postcard. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header onNavigate={navigate} currentPage={currentPage} />
      
      <main>
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={navigate} 
            onSelectTemplate={handleSelectTemplate}
          />
        )}
        
        {currentPage === 'create' && (
          <CreatePage 
            initialTemplate={selectedTemplate}
            onSave={handleSavePostcard}
          />
        )}
        
        {currentPage === 'gallery' && (
          <GalleryPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cream-200 py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-cream-500 text-sm">
            Made with 💌 using the warm "Nature Distilled" palette
          </p>
        </div>
      </footer>

      {/* Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500 mb-4" />
            <p className="text-cream-800 font-medium">Saving your postcard...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

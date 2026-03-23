import { useState, useEffect, useRef, useCallback } from 'react'
import { CharacterShowcase } from './CharacterShowcase'
import { PostcardEditor } from './PostcardEditor'
import { OccasionSelector, OCCASIONS, type Occasion } from './OccasionSelector'

export function SinglePage() {
  const [scrollY, setScrollY] = useState(0)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const occasionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToEditor = useCallback(() => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setShowEditor(true)
  }, [])

  const scrollToOccasions = useCallback(() => {
    occasionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleOccasionSelect = useCallback((occasion: Occasion) => {
    setSelectedOccasion(occasion)
    // Auto-scroll to editor after short delay
    setTimeout(() => {
      scrollToEditor()
    }, 500)
  }, [scrollToEditor])

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #FDF8F3 0%, #FAF3EA 50%, #F5E9D9 100%)' }}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(#C67B5C 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-100/50 text-terracotta-700 text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            Create Magical Postcards
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream-900 mb-6 leading-tight animate-slide-up">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-terracotta-500 via-dustyrose-500 to-terracotta-600">
              Memories
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-cream-600 mb-8 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            Design beautiful postcards with AI-powered character transformations. 
            Choose an occasion and create something special.
          </p>

          <button
            onClick={scrollToOccasions}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-terracotta-500 hover:bg-terracotta-600 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-warm hover:shadow-[0_12px_40px_-8px_rgba(198,123,92,0.4)] hover:-translate-y-1 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <span>Choose Occasion</span>
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-y-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-sage-200/30 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-dustyrose-200/30 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full bg-golden-200/30 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </section>

      {/* Occasion Selector - AT THE TOP */}
      <section 
        ref={occasionRef}
        className="relative py-8 px-4 bg-white/40 backdrop-blur-sm border-y border-cream-200"
      >
        <OccasionSelector 
          onSelect={handleOccasionSelect}
          selectedOccasion={selectedOccasion}
        />
      </section>

      {/* Character Showcase - Characters slide in from sides */}
      <CharacterShowcase scrollY={scrollY} />

      {/* Main Editor Section */}
      <section 
        ref={editorRef}
        className="relative py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-4">
              {selectedOccasion ? `Design Your ${selectedOccasion.name} Postcard` : 'Design Your Postcard'}
            </h2>
            <p className="text-cream-600 max-w-lg mx-auto">
              {selectedOccasion 
                ? `Create a beautiful ${selectedOccasion.name.toLowerCase()} postcard with personalized touches.`
                : 'Use the editor below to create your masterpiece. Add photos, customize text, and make it uniquely yours.'
              }
            </p>
          </div>

          <PostcardEditor occasion={selectedOccasion} />
        </div>
      </section>

      {/* Gallery Teaser */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-soft border border-cream-200">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-cream-900 mb-4">
              Your Collection Awaits
            </h3>
            <p className="text-cream-600 mb-6">
              All your created postcards are saved to your personal gallery. 
              Revisit, edit, or share them anytime.
            </p>
            <a 
              href="#gallery"
              className="inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors"
            >
              View My Gallery
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-cream-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-cream-500 text-sm">
            Made with 💌 using the warm &quot;Nature Distilled&quot; palette
          </p>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { CharacterShowcase } from './CharacterShowcase'
import { PostcardEditor } from './PostcardEditor'
import { OccasionSelector, type Occasion } from './OccasionSelector'
import { RecipientInput } from './RecipientInput'
import { MessageSelector } from './MessageSelector'
import { PrintPurchaseOptions } from './PrintPurchaseOptions'

// Scroll phase thresholds for scroll-based preview focus effect
// These represent how centered the preview is in the viewport (0 = entering, 1 = centered/past)
const SCROLL_PHASES = {
  NORMAL: 0.30,      // 0-30%: Normal view, no fading
  FADE_START: 0.30,  // 30%: Elements start fading as preview approaches center
  FADE_END: 0.50,    // 50%: Preview is centered, everything else fully faded
  FOCUS_HOLD: 0.70,  // 50-70%: Preview stays focused, ready for next section
  OPTIONS_SHOW: 0.70, // 70%: Print/Purchase options start appearing
}

// Flow steps
type FlowStep = 'occasion' | 'recipient' | 'message' | 'editor'

export function SinglePage() {
  const [scrollY, setScrollY] = useState(0)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isPreviewFocused, setIsPreviewFocused] = useState(false)
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false)
  
  // Smart Text Customization State
  const [currentStep, setCurrentStep] = useState<FlowStep>('occasion')
  const [recipientName, setRecipientName] = useState('')
  const [recipientAge, setRecipientAge] = useState<number | undefined>(undefined)
  const [selectedMessage, setSelectedMessage] = useState<string>('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const occasionRef = useRef<HTMLDivElement>(null)
  const previewSectionRef = useRef<HTMLDivElement>(null)

  // Calculate scroll progress based on preview position in viewport
  // This creates the scroll-based focus effect where surrounding elements fade as preview centers
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrollY(scrollY)

      if (previewSectionRef.current) {
        const previewRect = previewSectionRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const viewportCenter = viewportHeight / 2
        const previewCenter = previewRect.top + previewRect.height / 2
        
        // Calculate how close preview is to viewport center (0 = far, 1 = centered)
        // Distance from viewport center, normalized by viewport height
        const distanceFromCenter = Math.abs(previewCenter - viewportCenter)
        const maxDistance = viewportHeight * 0.8 // Distance at which effect is fully active
        
        // Progress: 0 = preview entering viewport, 0.5 = centered, 1 = scrolled past
        const progress = Math.max(0, Math.min(1, 1 - (distanceFromCenter / maxDistance)))
        setScrollProgress(progress)
        
        // Update focus states based on progress
        // Focus is active when preview is near center (30% to 70% progress)
        setIsPreviewFocused(progress >= SCROLL_PHASES.FADE_START && progress < SCROLL_PHASES.OPTIONS_SHOW)
        // Show purchase options when scrolled past the preview focus zone
        setShowPurchaseOptions(progress >= SCROLL_PHASES.OPTIONS_SHOW)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate opacity for fading elements based on scroll progress
  // Elements fade out as preview approaches center (30% to 50% progress)
  const getFadeOpacity = () => {
    if (scrollProgress < SCROLL_PHASES.FADE_START) return 1
    if (scrollProgress > SCROLL_PHASES.FADE_END) return 0
    // Smooth fade between 30% and 50% progress
    return 1 - ((scrollProgress - SCROLL_PHASES.FADE_START) / (SCROLL_PHASES.FADE_END - SCROLL_PHASES.FADE_START))
  }

  // Calculate blur amount for fading elements
  // Blur increases as elements fade out for smoother visual transition
  const getFadeBlur = () => {
    if (scrollProgress < SCROLL_PHASES.FADE_START) return 0
    if (scrollProgress > SCROLL_PHASES.FADE_END) return 12
    // Smooth blur increase from 0 to 12px
    return ((scrollProgress - SCROLL_PHASES.FADE_START) / (SCROLL_PHASES.FADE_END - SCROLL_PHASES.FADE_START)) * 12
  }

  // Calculate scale for preview when it's centered
  // Preview subtly scales up when focused for emphasis
  const getPreviewScale = () => {
    if (scrollProgress < SCROLL_PHASES.FADE_START) return 1
    if (scrollProgress > SCROLL_PHASES.FOCUS_HOLD) return 1.02
    // Smooth scale between fade start and focus hold
    return 1 + ((scrollProgress - SCROLL_PHASES.FADE_START) / (SCROLL_PHASES.FOCUS_HOLD - SCROLL_PHASES.FADE_START)) * 0.02
  }

  // Calculate opacity for the purchase options overlay
  // Options fade in as user scrolls past the preview focus zone
  const getOptionsOpacity = () => {
    if (scrollProgress < SCROLL_PHASES.OPTIONS_SHOW) return 0
    // Fade in over 10% progress after threshold
    return Math.min(1, (scrollProgress - SCROLL_PHASES.OPTIONS_SHOW) / 0.15)
  }

  const scrollToEditor = useCallback(() => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setShowEditor(true)
  }, [])

  const scrollToOccasions = useCallback(() => {
    occasionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Handle occasion selection
  const handleOccasionSelect = useCallback((occasion: Occasion) => {
    setSelectedOccasion(occasion)
    // Don't auto-scroll - wait for user to click Continue
  }, [])

  // Handle continue from occasion selection
  const handleOccasionContinue = useCallback(() => {
    setCurrentStep('recipient')
    // Smooth scroll to show the recipient input
    setTimeout(() => {
      occasionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  // Handle recipient submission
  const handleRecipientSubmit = useCallback((name: string, age?: number) => {
    setRecipientName(name)
    setRecipientAge(age)
    setCurrentStep('message')
  }, [])

  // Handle message selection
  const handleMessageSelect = useCallback((message: string) => {
    setSelectedMessage(message)
    setCurrentStep('editor')
    scrollToEditor()
  }, [scrollToEditor])

  // Handle back navigation
  const handleBackToOccasion = useCallback(() => {
    setCurrentStep('occasion')
    setSelectedOccasion(null)
    setRecipientName('')
    setRecipientAge(undefined)
    setSelectedMessage('')
  }, [])

  const handleBackToRecipient = useCallback(() => {
    setCurrentStep('recipient')
  }, [])

  const handleBackToMessage = useCallback(() => {
    setCurrentStep('message')
  }, [])

  // Handle reset personalization
  const handleResetPersonalization = useCallback(() => {
    setCurrentStep('occasion')
    setSelectedOccasion(null)
    setRecipientName('')
    setRecipientAge(undefined)
    setSelectedMessage('')
    scrollToOccasions()
  }, [scrollToOccasions])

  const fadeOpacity = getFadeOpacity()
  const fadeBlur = getFadeBlur()
  const previewScale = getPreviewScale()
  const optionsOpacity = getOptionsOpacity()

  // Render the appropriate content based on current step
  const renderOccasionSection = () => {
    switch (currentStep) {
      case 'occasion':
        return (
          <OccasionSelector 
            onSelect={handleOccasionSelect}
            selectedOccasion={selectedOccasion}
            showContinue={!!selectedOccasion}
            onContinue={handleOccasionContinue}
          />
        )
      case 'recipient':
        return (
          <RecipientInput
            occasion={selectedOccasion}
            onSubmit={handleRecipientSubmit}
            onBack={handleBackToOccasion}
          />
        )
      case 'message':
        return (
          <MessageSelector
            occasion={selectedOccasion}
            recipientName={recipientName}
            recipientAge={recipientAge}
            onSelect={handleMessageSelect}
            onBack={handleBackToRecipient}
          />
        )
      case 'editor':
        return null // Editor is rendered in its own section
      default:
        return null
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #FDF8F3 0%, #FAF3EA 50%, #F5E9D9 100%)' }}
    >
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{ 
          opacity: 0.03 * fadeOpacity,
          filter: `blur(${fadeBlur}px)`
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(#C67B5C 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Fading Content Wrapper */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          opacity: fadeOpacity,
          filter: `blur(${fadeBlur}px)`,
          pointerEvents: fadeOpacity < 0.1 ? 'none' : 'auto'
        }}
      >
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

        {/* Occasion Selector / Recipient Input / Message Selector */}
        {currentStep !== 'editor' && (
          <section 
            ref={occasionRef}
            className="relative py-8 px-4 bg-white/40 backdrop-blur-sm border-y border-cream-200 min-h-[400px]"
          >
            {renderOccasionSection()}
          </section>
        )}

        {/* Character Showcase - Only show before editor */}
        {currentStep !== 'editor' && <CharacterShowcase />}

        {/* Main Editor Section */}
        <section 
          ref={editorRef}
          className={`relative py-16 px-4 ${currentStep === 'editor' ? 'animate-fade-in' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-4">
                {selectedOccasion ? `Design Your ${selectedOccasion.name} Postcard` : 'Design Your Postcard'}
              </h2>
              <p className="text-cream-600 max-w-lg mx-auto">
                {selectedOccasion 
                  ? `Create a beautiful ${selectedOccasion.name.toLowerCase()} postcard for ${recipientName}.`
                  : 'Use the editor below to create your masterpiece. Add photos, customize text, and make it uniquely yours.'
                }
              </p>
              
              {/* Back Button when in editor */}
              {currentStep === 'editor' && (
                <button
                  onClick={handleBackToMessage}
                  className="mt-4 inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Message Selection
                </button>
              )}
            </div>

            {/* Editor with Preview Focus Support */}
            <div 
              ref={previewSectionRef}
              className="transition-transform duration-500 ease-out"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'center center'
              }}
            >
              <PostcardEditor 
                occasion={selectedOccasion}
                recipientName={recipientName}
                recipientAge={recipientAge}
                isFocused={isPreviewFocused}
                focusProgress={scrollProgress}
                previewScale={previewScale}
                initialMessage={selectedMessage}
                onResetPersonalization={handleResetPersonalization}
              />
            </div>
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

      {/* Print/Purchase Options Overlay */}
      <PrintPurchaseOptions isVisible={showPurchaseOptions} opacity={optionsOpacity} />
    </div>
  )
}

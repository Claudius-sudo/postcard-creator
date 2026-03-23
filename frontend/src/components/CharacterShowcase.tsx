import { useEffect, useRef, useState, useCallback } from 'react'
import { CharacterCard } from './CharacterCard'

interface Character {
  id: number
  name: string
  style: string
  description: string
  beforeImage: string
  afterImage: string
  side: 'left' | 'right'
  offsetY: number
  scrollThreshold: number // 0-100, when character appears (percentage of page scroll)
  bounceDelay: number // Delay for bounce animation offset
}

const characters: Character[] = [
  {
    id: 1,
    name: "Luna",
    style: "3D Cartoon",
    description: "Vibrant and playful",
    beforeImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    afterImage: "/characters/luna-3d.png",
    side: 'left',
    offsetY: 0,
    scrollThreshold: 5,
    bounceDelay: 0
  },
  {
    id: 2,
    name: "Kai",
    style: "Anime Style",
    description: "Elegant and expressive",
    beforeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    afterImage: "/characters/kai-anime.png",
    side: 'right',
    offsetY: 100,
    scrollThreshold: 15,
    bounceDelay: 0.5
  },
  {
    id: 3,
    name: "Milo",
    style: "Watercolor",
    description: "Soft and artistic",
    beforeImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    afterImage: "/characters/milo-watercolor.png",
    side: 'left',
    offsetY: 200,
    scrollThreshold: 30,
    bounceDelay: 1
  },
  {
    id: 4,
    name: "Zara",
    style: "Digital Art",
    description: "Bold and modern",
    beforeImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    afterImage: "/characters/zara-digital.png",
    side: 'right',
    offsetY: 150,
    scrollThreshold: 45,
    bounceDelay: 0.3
  },
  {
    id: 5,
    name: "Oliver",
    style: "Pixar Style",
    description: "Friendly and charming",
    beforeImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    afterImage: "/characters/oliver-pixar.png",
    side: 'left',
    offsetY: 300,
    scrollThreshold: 60,
    bounceDelay: 0.7
  },
  {
    id: 6,
    name: "Sophie",
    style: "Chibi",
    description: "Cute and bubbly",
    beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    afterImage: "/characters/sophie-chibi.png",
    side: 'right',
    offsetY: 250,
    scrollThreshold: 75,
    bounceDelay: 0.2
  },
  {
    id: 7,
    name: "Leo",
    style: "Vector Art",
    description: "Clean and graphic",
    beforeImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    afterImage: "/characters/leo-vector.png",
    side: 'left',
    offsetY: 400,
    scrollThreshold: 88,
    bounceDelay: 0.9
  }
]

interface CharacterShowcaseProps {
  scrollY: number
}

export function CharacterShowcase({ scrollY }: CharacterShowcaseProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [visibleCharacters, setVisibleCharacters] = useState<Set<number>>(new Set())
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Calculate scroll progress (0-100) based on full page height
  useEffect(() => {
    const calculateScrollProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
      setScrollProgress(Math.min(100, Math.max(0, progress)))
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    calculateScrollProgress()
    checkMobile()

    window.addEventListener('scroll', calculateScrollProgress, { passive: true })
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('scroll', calculateScrollProgress)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Update visible characters based on scroll progress
  useEffect(() => {
    const newVisible = new Set<number>()
    characters.forEach((char) => {
      if (scrollProgress >= char.scrollThreshold) {
        newVisible.add(char.id)
      }
    })
    setVisibleCharacters(newVisible)
  }, [scrollProgress])

  const handleCharacterClick = useCallback((character: Character) => {
    setSelectedCharacter(character)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedCharacter(null)
  }, [])

  // Calculate character position based on scroll progress
  const getCharacterStyle = (character: Character) => {
    const isVisible = visibleCharacters.has(character.id)
    
    // Base position calculation - characters move slightly as user scrolls
    const scrollOffset = (scrollProgress - character.scrollThreshold) * 2
    const baseY = character.offsetY + (isVisible ? scrollOffset : 0)
    
    return {
      top: `${baseY}px`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible 
        ? 'translateX(0) scale(1)' 
        : character.side === 'left' 
          ? 'translateX(-150%) scale(0.8)' 
          : 'translateX(150%) scale(0.8)',
      transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      animationDelay: `${character.bounceDelay}s`
    }
  }

  const leftCharacters = characters.filter(c => c.side === 'left')
  const rightCharacters = characters.filter(c => c.side === 'right')

  return (
    <>
      {/* Fixed Character Container - Characters bounce throughout the entire page */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {/* Left Side Characters */}
        {leftCharacters.map((char) => (
          <div
            key={char.id}
            className="absolute pointer-events-auto character-bounce"
            style={{
              ...getCharacterStyle(char),
              left: isMobile ? '2%' : '5%',
              maxWidth: isMobile ? '100px' : '180px'
            }}
          >
            <CharacterCard
              character={char}
              isVisible={visibleCharacters.has(char.id)}
              direction="left"
              onClick={() => handleCharacterClick(char)}
              bounceDelay={char.bounceDelay}
            />
          </div>
        ))}

        {/* Right Side Characters */}
        {rightCharacters.map((char) => (
          <div
            key={char.id}
            className="absolute pointer-events-auto character-bounce"
            style={{
              ...getCharacterStyle(char),
              right: isMobile ? '2%' : '5%',
              maxWidth: isMobile ? '100px' : '180px'
            }}
          >
            <CharacterCard
              character={char}
              isVisible={visibleCharacters.has(char.id)}
              direction="right"
              onClick={() => handleCharacterClick(char)}
              bounceDelay={char.bounceDelay}
            />
          </div>
        ))}
      </div>

      {/* Section Header - Still visible in the flow */}
      <section className="relative py-8 min-h-[400px] z-20">
        <div className="text-center mb-12 px-4">
          <span className="inline-block px-4 py-1 rounded-full bg-sage-100 text-sage-700 text-sm font-medium mb-4">
            AI Transformations
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-3">
            Meet the Characters
          </h2>
          <p className="text-cream-600 max-w-md mx-auto">
            Scroll to see characters appear and bounce around. Click any character to see the before/after transformation.
          </p>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {characters.map((char) => (
            <div
              key={char.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                visibleCharacters.has(char.id) 
                  ? 'bg-terracotta-500 w-6' 
                  : 'bg-cream-300'
              }`}
              title={char.name}
            />
          ))}
        </div>
      </section>

      {/* Before/After Modal */}
      {selectedCharacter && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-3xl overflow-hidden max-w-5xl w-full shadow-2xl animate-modal-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
            >
              <svg className="w-5 h-5 text-cream-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Split View: Before/After */}
            <div className="grid md:grid-cols-2">
              {/* Before Image - Left Side */}
              <div className="relative aspect-square bg-cream-100">
                <img
                  src={selectedCharacter.beforeImage}
                  alt={`${selectedCharacter.name} - Original`}
                  className="w-full h-full object-cover"
                />
                {/* Label */}
                <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium backdrop-blur-sm">
                  Original
                </div>
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* After Image - Right Side */}
              <div className="relative aspect-square bg-gradient-to-br from-terracotta-50 to-sage-50">
                {/* Character Image with transparent background */}
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="relative w-full h-full">
                    {/* Placeholder for AI-generated character image */}
                    <img
                      src={selectedCharacter.afterImage}
                      alt={`${selectedCharacter.name} - Character`}
                      className="w-full h-full object-contain drop-shadow-2xl"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    {/* Fallback content if image fails */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center character-fallback">
                      <div className="w-32 h-32 rounded-full bg-terracotta-200/50 flex items-center justify-center mb-4 animate-float">
                        <svg className="w-16 h-16 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <h4 className="font-display text-xl font-bold text-cream-900 mb-2">
                        {selectedCharacter.style}
                      </h4>
                      <p className="text-cream-600 text-sm mb-4">
                        AI-generated character
                      </p>
                      <button 
                        className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium rounded-xl transition-colors"
                        onClick={() => {
                          console.log('Generate with Stitch:', selectedCharacter)
                        }}
                      >
                        Generate with Stitch
                      </button>
                    </div>
                  </div>
                </div>
                {/* Label */}
                <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-terracotta-500 text-white text-sm font-medium">
                  Character
                </div>
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>

            {/* Character Info Footer */}
            <div className="p-6 bg-cream-50 border-t border-cream-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-cream-900 mb-1">
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-cream-600">
                    {selectedCharacter.description} • {selectedCharacter.style}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-cream-500">
                  <span className="w-3 h-3 rounded-full bg-terracotta-400" />
                  <span>AI Transformed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for bounce animation */}
      <style>{`
        @keyframes characterBounce {
          0%, 100% {
            transform: translateY(0) rotate(-2deg);
          }
          25% {
            transform: translateY(-15px) rotate(2deg);
          }
          50% {
            transform: translateY(-8px) rotate(-1deg);
          }
          75% {
            transform: translateY(-20px) rotate(1deg);
          }
        }

        .character-bounce {
          animation: characterBounce 4s ease-in-out infinite;
        }

        .character-bounce:nth-child(2n) {
          animation-duration: 5s;
        }

        .character-bounce:nth-child(3n) {
          animation-duration: 3.5s;
        }

        .character-bounce:nth-child(4n) {
          animation-duration: 4.5s;
        }

        @keyframes modalIn {
          0% {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .animate-modal-in {
          animation: modalIn 0.3s ease-out forwards;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Hide fallback when image loads successfully */
        img[src]:not([src=""]) + .character-fallback {
          display: none;
        }

        /* Mobile responsiveness for modal */
        @media (max-width: 768px) {
          .character-bounce {
            animation-duration: 3s !important;
          }
        }
      `}</style>
    </>
  )
}

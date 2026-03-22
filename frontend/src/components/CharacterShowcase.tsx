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
    offsetY: 0
  },
  {
    id: 2,
    name: "Kai",
    style: "Anime Style",
    description: "Elegant and expressive",
    beforeImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    afterImage: "/characters/kai-anime.png",
    side: 'right',
    offsetY: 100
  },
  {
    id: 3,
    name: "Milo",
    style: "Watercolor",
    description: "Soft and artistic",
    beforeImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    afterImage: "/characters/milo-watercolor.png",
    side: 'left',
    offsetY: 300
  },
  {
    id: 4,
    name: "Zara",
    style: "Digital Art",
    description: "Bold and modern",
    beforeImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    afterImage: "/characters/zara-digital.png",
    side: 'right',
    offsetY: 200
  },
  {
    id: 5,
    name: "Oliver",
    style: "Pixar Style",
    description: "Friendly and charming",
    beforeImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    afterImage: "/characters/oliver-pixar.png",
    side: 'left',
    offsetY: 500
  }
]

interface CharacterShowcaseProps {
  scrollY: number
}

export function CharacterShowcase({ scrollY }: CharacterShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visibleCharacters, setVisibleCharacters] = useState<Set<number>>(new Set())
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const charId = Number(entry.target.getAttribute('data-char-id'))
          setVisibleCharacters((prev) => {
            const next = new Set(prev)
            if (entry.isIntersecting) {
              next.add(charId)
            } else {
              next.delete(charId)
            }
            return next
          })
        })
      },
      {
        threshold: 0.2,
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-char-id]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  const handleCharacterClick = useCallback((character: Character) => {
    setSelectedCharacter(character)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedCharacter(null)
  }, [])

  const leftCharacters = characters.filter(c => c.side === 'left')
  const rightCharacters = characters.filter(c => c.side === 'right')

  return (
    <section 
      ref={sectionRef}
      className="relative py-8 min-h-[800px]"
    >
      {/* Section Header */}
      <div className="text-center mb-12 px-4">
        <span className="inline-block px-4 py-1 rounded-full bg-sage-100 text-sage-700 text-sm font-medium mb-4">
          AI Transformations
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-3">
          Meet the Characters
        </h2>
        <p className="text-cream-600 max-w-md mx-auto">
          Scroll to see characters slide in. Click any card to see the before/after transformation.
        </p>
      </div>

      {/* Characters Container */}
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-start gap-8 md:gap-16">
          
          {/* Left Side Characters */}
          <div className="flex flex-col gap-8 w-1/3">
            {leftCharacters.map((char) => (
              <div
                key={char.id}
                data-char-id={char.id}
                style={{ marginTop: char.offsetY * 0.5 }}
              >
                <CharacterCard
                  character={char}
                  isVisible={visibleCharacters.has(char.id)}
                  direction="left"
                  onClick={() => handleCharacterClick(char)}
                />
              </div>
            ))}
          </div>

          {/* Center Spacer - Editor will be here */}
          <div className="hidden md:block w-1/3" />

          {/* Right Side Characters */}
          <div className="flex flex-col gap-8 w-1/3">
            {rightCharacters.map((char) => (
              <div
                key={char.id}
                data-char-id={char.id}
                style={{ marginTop: char.offsetY * 0.5 }}
              >
                <CharacterCard
                  character={char}
                  isVisible={visibleCharacters.has(char.id)}
                  direction="right"
                  onClick={() => handleCharacterClick(char)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Before/After Modal */}
      {selectedCharacter && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl animate-modal-in"
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

            <div className="grid md:grid-cols-2">
              {/* Before Image */}
              <div className="relative aspect-square bg-cream-100">
                <img
                  src={selectedCharacter.beforeImage}
                  alt={`${selectedCharacter.name} - Original`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium backdrop-blur-sm">
                  Original Photo
                </div>
              </div>

              {/* After Image */}
              <div className="relative aspect-square bg-gradient-to-br from-terracotta-100 to-sage-100">
                {/* Placeholder for AI-generated image */}
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-32 h-32 rounded-full bg-terracotta-200/50 flex items-center justify-center mb-4">
                    <svg className="w-16 h-16 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="font-display text-xl font-bold text-cream-900 mb-2">
                    {selectedCharacter.style}
                  </h4>
                  <p className="text-cream-600 text-sm mb-4">
                    AI-generated character transformation
                  </p>
                  <button 
                    className="px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium rounded-xl transition-colors"
                    onClick={() => {
                      // Trigger Google Stitch generation
                      console.log('Generate with Stitch:', selectedCharacter)
                    }}
                  >
                    Generate with Stitch
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-terracotta-500 text-white text-sm font-medium">
                  {selectedCharacter.style}
                </div>
              </div>
            </div>

            {/* Character Info */}
            <div className="p-6 bg-cream-50">
              <h3 className="font-display text-2xl font-bold text-cream-900 mb-1">
                {selectedCharacter.name}
              </h3>
              <p className="text-cream-600">
                {selectedCharacter.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

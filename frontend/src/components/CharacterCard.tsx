import { useState } from 'react'

interface Character {
  id: number
  name: string
  style: string
  description: string
  beforeImage: string
  afterImage: string
  side: 'left' | 'right'
  offsetY: number
  scrollThreshold?: number
  bounceDelay?: number
}

interface CharacterCardProps {
  character: Character
  isVisible: boolean
  direction: 'left' | 'right'
  onClick: () => void
  bounceDelay?: number
}

export function CharacterCard({ character, isVisible, direction, onClick, bounceDelay = 0 }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Calculate transform based on visibility and hover
  const getTransform = () => {
    if (!isVisible) {
      // Hidden state - slide off screen
      return direction === 'left' 
        ? 'translateX(-150%) rotate(-15deg)' 
        : 'translateX(150%) rotate(15deg)'
    }
    
    // Visible state
    const hoverOffset = isHovered ? (direction === 'left' ? '8px' : '-8px') : '0'
    const rotate = isHovered ? '0deg' : (direction === 'left' ? '-3deg' : '3deg')
    
    return `translateX(${hoverOffset}) rotate(${rotate})`
  }

  return (
    <div
      className="relative cursor-pointer group character-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transform: getTransform(),
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: isVisible ? 1 : 0,
        animationDelay: `${bounceDelay}s`
      }}
    >
      {/* Card Container with Glassmorphism */}
      <div 
        className={`
          relative w-full rounded-2xl overflow-hidden
          bg-white/80 backdrop-blur-md
          border border-white/60
          shadow-[0_8px_32px_rgba(198,123,92,0.15)]
          transition-all duration-300
          ${isHovered ? 'shadow-[0_16px_48px_rgba(198,123,92,0.3)] scale-105' : ''}
        `}
      >
        {/* Image Container - Transparent Background Support */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-cream-50/50 to-transparent">
          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-cream-200 animate-pulse" />
          )}
          
          {/* Character Image - Using afterImage (transparent PNG) as primary */}
          <img
            src={character.afterImage}
            alt={character.name}
            className={`
              w-full h-full object-contain p-2
              transition-all duration-500
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              imageRendering: 'auto'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />

          {/* Fallback to beforeImage if afterImage fails */}
          {imageError && (
            <img
              src={character.beforeImage}
              alt={character.name}
              className={`
                absolute inset-0 w-full h-full object-cover
                transition-all duration-500
                ${isHovered ? 'scale-110' : 'scale-100'}
              `}
            />
          )}

          {/* Subtle gradient overlay for depth */}
          <div 
            className={`
              absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
              transition-opacity duration-300 pointer-events-none
              ${isHovered ? 'opacity-100' : 'opacity-60'}
            `}
          />

          {/* Style Badge */}
          <div 
            className={`
              absolute top-2 ${direction === 'left' ? 'left-2' : 'right-2'}
              px-2 py-1 rounded-lg
              bg-white/90 backdrop-blur-sm
              text-xs font-semibold text-terracotta-600
              shadow-sm
              transition-transform duration-300
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
          >
            {character.style}
          </div>

          {/* Hover Hint */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center
              transition-opacity duration-300
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
              <svg className="w-5 h-5 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>

          {/* Name at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="font-display text-base font-bold text-white drop-shadow-lg">
              {character.name}
            </h3>
            <p className="text-white/80 text-xs">
              {character.description}
            </p>
          </div>
        </div>

        {/* Click Hint Footer */}
        <div 
          className={`
            px-2 py-1.5 bg-cream-50/90 backdrop-blur-sm
            border-t border-cream-200/50
            transition-all duration-300
            ${isHovered ? 'bg-terracotta-50/90' : ''}
          `}
        >
          <p className="text-xs text-cream-600 text-center font-medium">
            {isHovered ? 'Click to compare ✨' : 'Click to view'}
          </p>
        </div>
      </div>

      {/* Decorative Elements - Soft glow */}
      <div 
        className={`
          absolute -z-10 rounded-full blur-2xl
          transition-all duration-500
          ${direction === 'left' ? '-right-6' : '-left-6'}
          ${isHovered ? 'w-28 h-28 opacity-50' : 'w-20 h-20 opacity-25'}
        `}
        style={{
          background: direction === 'left' 
            ? 'linear-gradient(135deg, rgba(198, 123, 92, 0.6), rgba(217, 136, 136, 0.4))' 
            : 'linear-gradient(135deg, rgba(90, 138, 90, 0.6), rgba(123, 168, 123, 0.4))',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
    </div>
  )
}

// Before/After Comparison Modal Component
interface BeforeAfterModalProps {
  character: Character | null
  isOpen: boolean
  onClose: () => void
}

export function BeforeAfterModal({ character, isOpen, onClose }: BeforeAfterModalProps) {
  const [activeSide, setActiveSide] = useState<'before' | 'after' | 'both'>('both')
  const [afterImageLoaded, setAfterImageLoaded] = useState(false)
  const [afterImageError, setAfterImageError] = useState(false)

  if (!isOpen || !character) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl overflow-hidden max-w-5xl w-full shadow-2xl animate-modal-in max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <svg className="w-5 h-5 text-cream-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* View Toggle - Mobile Only */}
        <div className="md:hidden flex justify-center gap-2 p-4 bg-cream-50 border-b border-cream-200">
          <button
            onClick={() => setActiveSide('before')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSide === 'before' 
                ? 'bg-terracotta-500 text-white' 
                : 'bg-white text-cream-600'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveSide('after')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSide === 'after' 
                ? 'bg-terracotta-500 text-white' 
                : 'bg-white text-cream-600'
            }`}
          >
            Character
          </button>
          <button
            onClick={() => setActiveSide('both')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSide === 'both' 
                ? 'bg-terracotta-500 text-white' 
                : 'bg-white text-cream-600'
            }`}
          >
            Both
          </button>
        </div>

        {/* Split View: Before/After */}
        <div className="grid md:grid-cols-2">
          {/* Before Image - Left Side */}
          <div 
            className={`relative aspect-square bg-cream-100 transition-all duration-300 ${
              activeSide === 'after' ? 'hidden md:block' : ''
            }`}
          >
            <img
              src={character.beforeImage}
              alt={`${character.name} - Original`}
              className="w-full h-full object-cover"
            />
            {/* Label */}
            <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium backdrop-blur-sm">
              Original
            </div>
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Mobile Label at bottom */}
            <div className="absolute bottom-4 left-4 right-4 md:hidden">
              <p className="text-white text-sm font-medium drop-shadow-lg">Original Photo</p>
            </div>
          </div>

          {/* After Image - Right Side */}
          <div 
            className={`relative aspect-square bg-gradient-to-br from-terracotta-50 via-cream-50 to-sage-50 transition-all duration-300 ${
              activeSide === 'before' ? 'hidden md:block' : ''
            }`}
          >
            {/* Character Image with transparent background */}
            <div className="w-full h-full flex items-center justify-center p-6 md:p-10">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Transparent PNG Character Image */}
                {!afterImageError ? (
                  <img
                    src={character.afterImage}
                    alt={`${character.name} - Character`}
                    className={`
                      max-w-full max-h-full object-contain
                      transition-all duration-500
                      ${afterImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                    `}
                    style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15)) drop-shadow(0 4px 8px rgba(198,123,92,0.1))',
                      imageRendering: 'auto'
                    }}
                    onLoad={() => setAfterImageLoaded(true)}
                    onError={() => {
                      setAfterImageError(true)
                      setAfterImageLoaded(true)
                    }}
                  />
                ) : null}

                {/* Loading State */}
                {!afterImageLoaded && !afterImageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-terracotta-200/50 animate-pulse flex items-center justify-center">
                      <svg className="w-10 h-10 text-terracotta-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Fallback content if image fails */}
                {afterImageError && (
                  <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="w-28 h-28 rounded-full bg-terracotta-200/50 flex items-center justify-center mb-4 animate-float">
                      <svg className="w-14 h-14 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h4 className="font-display text-xl font-bold text-cream-900 mb-2">
                      {character.style}
                    </h4>
                    <p className="text-cream-600 text-sm mb-4">
                      AI-generated character transformation
                    </p>
                    <button 
                      className="px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Generate with Stitch:', character)
                      }}
                    >
                      Generate with Stitch
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Label */}
            <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-terracotta-500 text-white text-sm font-medium shadow-lg">
              Character
            </div>

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-terracotta-100/50 to-transparent" />

            {/* Mobile Label at bottom */}
            <div className="absolute bottom-4 left-4 right-4 md:hidden text-right">
              <p className="text-cream-800 text-sm font-medium drop-shadow-lg">{character.style}</p>
            </div>
          </div>
        </div>

        {/* Character Info Footer */}
        <div className="p-6 bg-cream-50 border-t border-cream-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-cream-900 mb-1">
                {character.name}
              </h3>
              <p className="text-cream-600">
                {character.description} • <span className="text-terracotta-600 font-medium">{character.style}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-cream-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-terracotta-400 animate-pulse" />
                <span>AI Transformed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Slider - Desktop Only */}
        <div className="hidden md:block px-6 pb-6 bg-cream-50">
          <div className="flex items-center justify-center gap-4 text-sm text-cream-500">
            <span>Compare:</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-black/10 text-cream-700 font-medium">
                Original Photo
              </span>
              <span className="text-cream-400">→</span>
              <span className="px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-700 font-medium">
                AI Character
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
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

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

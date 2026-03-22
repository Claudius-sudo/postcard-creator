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
}

interface CharacterCardProps {
  character: Character
  isVisible: boolean
  direction: 'left' | 'right'
  onClick: () => void
}

export function CharacterCard({ character, isVisible, direction, onClick }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Calculate transform based on visibility and hover
  const getTransform = () => {
    if (!isVisible) {
      // Hidden state - slide off screen
      return direction === 'left' 
        ? 'translateX(-150%) rotate(-15deg)' 
        : 'translateX(150%) rotate(15deg)'
    }
    
    // Visible state
    const hoverOffset = isHovered ? (direction === 'left' ? '10px' : '-10px') : '0'
    const rotate = isHovered ? '0deg' : (direction === 'left' ? '-3deg' : '3deg')
    
    return `translateX(${hoverOffset}) rotate(${rotate})`
  }

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transform: getTransform(),
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Card Container with Glassmorphism */}
      <div 
        className={`
          relative w-full max-w-[200px] rounded-2xl overflow-hidden
          bg-white/70 backdrop-blur-md
          border border-white/50
          shadow-[0_8px_32px_rgba(198,123,92,0.15)]
          transition-all duration-300
          ${isHovered ? 'shadow-[0_16px_48px_rgba(198,123,92,0.25)] scale-105' : ''}
        `}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-cream-200 animate-pulse" />
          )}
          
          {/* Character Image */}
          <img
            src={character.beforeImage}
            alt={character.name}
            className={`
              w-full h-full object-cover
              transition-all duration-500
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Gradient Overlay */}
          <div 
            className={`
              absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
              transition-opacity duration-300
              ${isHovered ? 'opacity-100' : 'opacity-70'}
            `}
          />

          {/* Style Badge */}
          <div 
            className={`
              absolute top-3 ${direction === 'left' ? 'left-3' : 'right-3'}
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
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>

          {/* Name at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-display text-lg font-bold text-white drop-shadow-lg">
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
            px-3 py-2 bg-cream-50/80 backdrop-blur-sm
            border-t border-cream-200/50
            transition-all duration-300
            ${isHovered ? 'bg-terracotta-50/80' : ''}
          `}
        >
          <p className="text-xs text-cream-600 text-center font-medium">
            {isHovered ? 'Click to see transformation ✨' : 'Click to transform'}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div 
        className={`
          absolute -z-10 rounded-full blur-xl
          transition-all duration-500
          ${direction === 'left' ? '-right-4' : '-left-4'}
          ${isHovered ? 'w-24 h-24 opacity-40' : 'w-16 h-16 opacity-20'}
        `}
        style={{
          background: direction === 'left' 
            ? 'linear-gradient(135deg, #C67B5C, #D98888)' 
            : 'linear-gradient(135deg, #5A8A5A, #7BA87B)',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
    </div>
  )
}

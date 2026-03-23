import { useState } from 'react'

export type Occasion = {
  id: string
  name: string
  icon: string
  description: string
  template: 'birthday' | 'thankyou' | 'love' | 'sympathy' | 'congrats' | 'holiday' | 'custom'
}

export const OCCASIONS: Occasion[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    description: 'Celebrate their special day',
    template: 'birthday'
  },
  {
    id: 'thankyou',
    name: 'Thank You',
    icon: '🙏',
    description: 'Show your appreciation',
    template: 'thankyou'
  },
  {
    id: 'love',
    name: 'Love & Romance',
    icon: '❤️',
    description: 'For someone special',
    template: 'love'
  },
  {
    id: 'congrats',
    name: 'Congratulations',
    icon: '🎉',
    description: 'Celebrate their success',
    template: 'congrats'
  },
  {
    id: 'sympathy',
    name: 'Sympathy',
    icon: '💐',
    description: 'Send comfort and care',
    template: 'sympathy'
  },
  {
    id: 'holiday',
    name: 'Holiday',
    icon: '🎄',
    description: 'Seasonal greetings',
    template: 'holiday'
  },
  {
    id: 'getwell',
    name: 'Get Well',
    icon: '🌻',
    description: 'Wish them a speedy recovery',
    template: 'custom'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    icon: '💍',
    description: 'Celebrate your journey',
    template: 'love'
  },
  {
    id: 'newbaby',
    name: 'New Baby',
    icon: '👶',
    description: 'Welcome the little one',
    template: 'congrats'
  },
  {
    id: 'newhome',
    name: 'New Home',
    icon: '🏠',
    description: 'Housewarming wishes',
    template: 'congrats'
  },
  {
    id: 'graduation',
    name: 'Graduation',
    icon: '🎓',
    description: 'Celebrate their achievement',
    template: 'congrats'
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✨',
    description: 'Create your own',
    template: 'custom'
  }
]

interface OccasionSelectorProps {
  onSelect: (occasion: Occasion) => void
  selectedOccasion?: Occasion | null
}

export function OccasionSelector({ onSelect, selectedOccasion }: OccasionSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-3">
          What occasion are you celebrating?
        </h2>
        <p className="text-cream-600 text-lg max-w-2xl mx-auto">
          Choose from our curated collection of templates designed for every special moment
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {OCCASIONS.map((occasion) => {
          const isSelected = selectedOccasion?.id === occasion.id
          const isHovered = hoveredId === occasion.id

          return (
            <button
              key={occasion.id}
              onClick={() => onSelect(occasion)}
              onMouseEnter={() => setHoveredId(occasion.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                relative group p-4 rounded-2xl text-center transition-all duration-300
                ${isSelected 
                  ? 'bg-terracotta-500 text-white shadow-lg scale-105' 
                  : 'bg-white/80 backdrop-blur-sm text-cream-800 hover:bg-terracotta-50 hover:shadow-md'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                text-4xl mb-3 transition-transform duration-300
                ${isHovered || isSelected ? 'scale-110' : ''}
              `}>
                {occasion.icon}
              </div>

              {/* Name */}
              <h3 className={`
                font-semibold text-sm mb-1
                ${isSelected ? 'text-white' : 'text-cream-900'}
              `}>
                {occasion.name}
              </h3>

              {/* Description - show on hover or selected */}
              <p className={`
                text-xs transition-all duration-300
                ${isSelected 
                  ? 'text-white/80 max-h-20 opacity-100' 
                  : isHovered 
                    ? 'text-cream-600 max-h-20 opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }
              `}>
                {occasion.description}
              </p>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Decorative gradient */}
              <div className={`
                absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none
                ${isHovered && !isSelected ? 'opacity-100' : ''}
              `}
              style={{
                background: 'linear-gradient(135deg, rgba(198, 123, 92, 0.1) 0%, rgba(198, 123, 92, 0.05) 100%)'
              }}
              />
            </button>
          )
        })}
      </div>

      {/* Selected occasion info */}
      {selectedOccasion && (
        <div className="mt-8 p-6 bg-terracotta-50 rounded-2xl border border-terracotta-200 animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{selectedOccasion.icon}</span>
            <div>
              <h3 className="font-display text-2xl font-bold text-terracotta-800">
                {selectedOccasion.name}
              </h3>
              <p className="text-terracotta-600">
                {selectedOccasion.description} • Perfect for creating heartfelt messages
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

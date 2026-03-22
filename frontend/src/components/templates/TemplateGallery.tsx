import React from 'react'
import { POSTCARD_TEMPLATES } from '../../utils/constants'
import type { PostcardTemplate } from '../../types'

interface TemplateGalleryProps {
  selectedTemplateId: string | null
  onSelectTemplate: (template: PostcardTemplate) => void
}

export function TemplateGallery({ selectedTemplateId, onSelectTemplate }: TemplateGalleryProps) {
  const categories = ['all', 'nature', 'minimal', 'vintage', 'playful'] as const
  const [activeCategory, setActiveCategory] = React.useState<typeof categories[number]>('all')

  const filteredTemplates = activeCategory === 'all'
    ? POSTCARD_TEMPLATES
    : POSTCARD_TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeCategory === category
                ? 'bg-terracotta-500 text-white shadow-soft'
                : 'bg-cream-100 text-cream-700 hover:bg-cream-200'
              }
            `}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`
              relative p-4 rounded-2xl text-left transition-all duration-300
              ${selectedTemplateId === template.id
                ? 'ring-2 ring-terracotta-500 ring-offset-2 ring-offset-cream-50 shadow-warm'
                : 'hover:shadow-soft'
            }
            `}
            style={{ backgroundColor: template.backgroundColor }}
          >
            <div className="aspect-[4/3] rounded-xl mb-3 overflow-hidden bg-white/50 flex items-center justify-center">
              <div className="text-center p-4">
                <p
                  className="text-lg font-medium line-clamp-2"
                  style={{ color: template.textColor, fontFamily: template.fontFamily }}
                >
                  {template.name}
                </p>
                <div
                  className="w-12 h-1 mx-auto mt-2 rounded-full"
                  style={{ backgroundColor: template.accentColor }}
                />
              </div>
            </div>
            <h3
              className="font-medium text-base mb-1"
              style={{ color: template.textColor }}
            >
              {template.name}
            </h3>
            <p className="text-sm opacity-70 line-clamp-2" style={{ color: template.textColor }}>
              {template.description}
            </p>
            
            {selectedTemplateId === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-terracotta-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

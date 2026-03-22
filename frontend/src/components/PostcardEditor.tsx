import { useState, useRef, useCallback } from 'react'
import { usePostcardDesign } from '../hooks/usePostcardDesign'
import { Button } from './ui/Button'
import type { PostcardTemplate } from '../types'

// Template options
const templates: PostcardTemplate[] = [
  {
    id: 'nature-1',
    name: 'Nature',
    description: 'Earthy tones with natural feel',
    backgroundColor: '#F5E9D9',
    textColor: '#5D3323',
    accentColor: '#C67B5C',
    fontFamily: 'Playfair Display',
    category: 'nature'
  },
  {
    id: 'minimal-1',
    name: 'Minimal',
    description: 'Clean and simple',
    backgroundColor: '#FFFFFF',
    textColor: '#2D2D2D',
    accentColor: '#5A8A5A',
    fontFamily: 'Inter',
    category: 'minimal'
  },
  {
    id: 'vintage-1',
    name: 'Vintage',
    description: 'Classic retro style',
    backgroundColor: '#FAF1DB',
    textColor: '#61461D',
    accentColor: '#B8862E',
    fontFamily: 'Playfair Display',
    category: 'vintage'
  }
]

export function PostcardEditor() {
  const {
    design,
    updateTitle,
    updateMessage,
    updateImage,
    updateFontFamily,
    updateTheme,
    applyTemplate,
    resetDesign,
  } = usePostcardDesign({})

  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExport = useCallback(async () => {
    if (!previewRef.current) return
    
    setIsExporting(true)
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Postcard saved successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to save postcard')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Template Selector */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-cream-200">
          <h3 className="font-display text-lg font-semibold text-cream-900 mb-4">
            Choose a Template
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template.id, {
                  backgroundColor: template.backgroundColor,
                  textColor: template.textColor,
                  accentColor: template.accentColor,
                  fontFamily: template.fontFamily,
                })}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200
                  ${design.templateId === template.id 
                    ? 'border-terracotta-500 bg-terracotta-50' 
                    : 'border-cream-200 hover:border-terracotta-300'
                  }
                `}
              >
                <div 
                  className="w-full h-12 rounded-lg mb-2"
                  style={{ backgroundColor: template.backgroundColor }}
                />
                <p className="text-xs font-medium text-cream-800">{template.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Inputs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-cream-200 space-y-4">
          <h3 className="font-display text-lg font-semibold text-cream-900">
            Your Message
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-cream-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={design.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Enter a title..."
              className="w-full px-4 py-3 rounded-xl border-2 border-cream-200 focus:border-terracotta-400 focus:outline-none transition-colors bg-cream-50/50"
              style={{ fontFamily: design.fontFamily }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cream-700 mb-2">
              Message
            </label>
            <textarea
              value={design.message}
              onChange={(e) => updateMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-cream-200 focus:border-terracotta-400 focus:outline-none transition-colors bg-cream-50/50 resize-none"
              style={{ fontFamily: design.fontFamily }}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-cream-200">
          <h3 className="font-display text-lg font-semibold text-cream-900 mb-4">
            Add Image
          </h3>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {design.image ? (
            <div className="relative">
              <img
                src={design.image}
                alt="Postcard"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={() => updateImage(null)}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <svg className="w-4 h-4 text-cream-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-cream-300 hover:border-terracotta-400 flex flex-col items-center justify-center gap-3 transition-colors bg-cream-50/50"
            >
              <div className="w-12 h-12 rounded-full bg-terracotta-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-cream-600">Click to upload an image</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={resetDesign} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="flex-1">
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Postcard
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:sticky lg:top-24 h-fit">
        <h3 className="font-display text-lg font-semibold text-cream-900 mb-4">
          Preview
        </h3>
        
        <div 
          ref={previewRef}
          className="rounded-2xl overflow-hidden shadow-warm transition-all duration-300"
          style={{ 
            backgroundColor: design.backgroundColor,
            aspectRatio: '3/2'
          }}
        >
          {/* Postcard Content */}
          <div className="h-full p-8 flex flex-col">
            {/* Title */}
            {design.title && (
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ 
                  color: design.textColor,
                  fontFamily: design.fontFamily 
                }}
              >
                {design.title}
              </h2>
            )}

            {/* Image */}
            {design.image && (
              <div className="flex-1 mb-4 rounded-xl overflow-hidden">
                <img
                  src={design.image}
                  alt="Postcard"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Message */}
            {design.message && (
              <p 
                className="text-base leading-relaxed whitespace-pre-wrap"
                style={{ 
                  color: design.textColor,
                  fontFamily: design.fontFamily 
                }}
              >
                {design.message}
              </p>
            )}

            {/* Empty State */}
            {!design.title && !design.message && !design.image && (
              <div className="flex-1 flex flex-col items-center justify-center text-cream-400">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Your postcard preview will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-cream-200">
            <p className="text-xl font-semibold text-terracotta-600">{design.title.length}</p>
            <p className="text-xs text-cream-500">Characters</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-cream-200">
            <p className="text-xl font-semibold text-terracotta-600">{design.message.length}</p>
            <p className="text-xs text-cream-500">Message</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-cream-200">
            <p className="text-xl font-semibold text-terracotta-600">{design.image ? '✓' : '—'}</p>
            <p className="text-xs text-cream-500">Image</p>
          </div>
        </div>
      </div>
    </div>
  )
}

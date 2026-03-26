import { useState, useRef, useCallback, useEffect } from 'react'
import { usePostcardDesign } from '../hooks/usePostcardDesign'
import { Button } from './ui/Button'
import type { PostcardTemplate } from '../types'
import type { Occasion } from './OccasionSelector'

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

interface PostcardEditorProps {
  occasion?: Occasion | null
  recipientName?: string
  recipientAge?: number
  isFocused?: boolean
  focusProgress?: number
  previewScale?: number
  initialMessage?: string
  onResetPersonalization?: () => void
}

export function PostcardEditor({
  occasion,
  recipientName,
  recipientAge,
  isFocused = false,
  focusProgress = 0,
  previewScale = 1,
  initialMessage,
  onResetPersonalization
}: PostcardEditorProps) {
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

  // Track original message for revert functionality
  const [originalMessage, setOriginalMessage] = useState<string | null>(null)
  const [hasBeenEdited, setHasBeenEdited] = useState(false)

  // Auto-apply template based on occasion
  useEffect(() => {
    if (occasion) {
      // Map occasion to template
      const templateMap: Record<string, string> = {
        'birthday': 'nature-1',
        'thankyou': 'minimal-1',
        'love': 'nature-1',
        'congrats': 'nature-1',
        'sympathy': 'minimal-1',
        'holiday': 'vintage-1',
        'getwell': 'nature-1',
        'anniversary': 'vintage-1',
        'newbaby': 'nature-1',
        'newhome': 'minimal-1',
        'graduation': 'nature-1',
        'custom': 'minimal-1'
      }
      const templateId = templateMap[occasion.id] || 'nature-1'
      const template = templates.find(t => t.id === templateId)
      if (template) {
        applyTemplate(template.id, {
          backgroundColor: template.backgroundColor,
          textColor: template.textColor,
          accentColor: template.accentColor,
          fontFamily: template.fontFamily,
        })
      }
    }
  }, [occasion, applyTemplate])

  // Set initial message when provided
  useEffect(() => {
    if (initialMessage && !originalMessage) {
      updateMessage(initialMessage)
      setOriginalMessage(initialMessage)
    }
  }, [initialMessage, originalMessage, updateMessage])

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

  // Handle message change with edit tracking
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value
    updateMessage(newMessage)
    if (originalMessage && newMessage !== originalMessage) {
      setHasBeenEdited(true)
    }
  }

  // Handle revert to standard message
  const handleRevert = () => {
    if (originalMessage) {
      updateMessage(originalMessage)
      setHasBeenEdited(false)
    }
  }

  // Calculate opacity for editor panel during focus
  // Editor fades out as preview approaches center (30% to 50% focusProgress)
  const getEditorOpacity = () => {
    if (focusProgress < 0.30) return 1
    if (focusProgress > 0.50) return 0
    // Smooth fade between 30% and 50% progress
    return 1 - ((focusProgress - 0.30) / 0.20)
  }

  const editorOpacity = getEditorOpacity()

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Editor Panel - Fades out when preview is focused */}
      <div 
        className="space-y-6 transition-all duration-500 ease-out"
        style={{
          opacity: editorOpacity,
          filter: `blur(${(1 - editorOpacity) * 8}px)`,
          pointerEvents: editorOpacity < 0.1 ? 'none' : 'auto',
          transform: `translateY(${(1 - editorOpacity) * -20}px)`
        }}
      >
        {/* Recipient Info Section */}
        {(recipientName || occasion) && (
          <div className="bg-terracotta-50 rounded-2xl p-6 border border-terracotta-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {occasion && (
                  <span className="text-3xl">{occasion.icon}</span>
                )}
                <div>
                  {recipientName && (
                    <h3 className="font-display text-xl font-bold text-terracotta-800">
                      For {recipientName}
                      {recipientAge && <span className="text-terracotta-600"> (turning {recipientAge})</span>}
                    </h3>
                  )}
                  {occasion && (
                    <p className="text-terracotta-600 text-sm">
                      {occasion.name} • {occasion.description}
                    </p>
                  )}
                </div>
              </div>
              {onResetPersonalization && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetPersonalization}
                  className="text-terracotta-600 hover:text-terracotta-700"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Change
                </Button>
              )}
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-cream-900">
              Your Message
            </h3>
            {hasBeenEdited && originalMessage && (
              <span className="text-xs text-terracotta-500 bg-terracotta-50 px-2 py-1 rounded-full">
                Edited
              </span>
            )}
          </div>
          
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
              onChange={handleMessageChange}
              placeholder="Write your message..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-cream-200 focus:border-terracotta-400 focus:outline-none transition-colors bg-cream-50/50 resize-none"
              style={{ fontFamily: design.fontFamily }}
            />
            
            {/* Revert Button - Bottom Right */}
            {originalMessage && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleRevert}
                  disabled={!hasBeenEdited}
                  className={`
                    text-sm flex items-center gap-1 transition-all duration-200
                    ${hasBeenEdited 
                      ? 'text-terracotta-600 hover:text-terracotta-700 hover:underline' 
                      : 'text-cream-400 cursor-not-allowed'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Revert to Standard Message
                </button>
              </div>
            )}
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

      {/* Preview Panel - Scales up and becomes focal point */}
      <div
        className={`
          lg:sticky lg:top-24 h-fit
          transition-all duration-500 ease-out
          ${isFocused ? 'z-50' : 'z-10'}
        `}
        style={{
          transform: `scale(${previewScale})`,
          transformOrigin: 'center center',
          filter: isFocused ? 'drop-shadow(0 25px 50px rgba(198, 123, 92, 0.25))' : 'none'
        }}
      >
        <h3 
          className="font-display text-lg font-semibold text-cream-900 mb-4 transition-opacity duration-300"
          style={{ opacity: isFocused ? 0 : 1 }}
        >
          Preview
        </h3>
        
        <div 
          ref={previewRef}
          className={`
            rounded-2xl overflow-hidden transition-all duration-500
            ${isFocused 
              ? 'shadow-[0_25px_80px_-20px_rgba(198,123,92,0.4)]' 
              : 'shadow-warm'
            }
          `}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Your postcard preview will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats - Hidden when focused */}
        <div 
          className="mt-6 grid grid-cols-3 gap-3 transition-all duration-300"
          style={{
            opacity: isFocused ? 0 : 1,
            transform: isFocused ? 'translateY(10px)' : 'translateY(0)',
            pointerEvents: isFocused ? 'none' : 'auto'
          }}
        >
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

        {/* Scroll hint - shown when focused */}
        <div
          className={`
            mt-6 text-center transition-all duration-500
            ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
          `}
        >
          <p className="text-cream-600 text-sm mb-2">Keep scrolling to see options</p>
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 mx-auto text-terracotta-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

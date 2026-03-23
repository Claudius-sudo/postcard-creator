import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/Button'
import type { Occasion } from './OccasionSelector'
import messageTemplates from '../data/messageTemplates.json'

interface MessageSelectorProps {
  occasion: Occasion | null
  recipientName: string
  recipientAge?: number
  onSelect: (message: string) => void
  onBack: () => void
}

type TemplateCategory = keyof typeof messageTemplates

export function MessageSelector({ 
  occasion, 
  recipientName, 
  recipientAge, 
  onSelect, 
  onBack 
}: MessageSelectorProps) {
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Get age category for birthday templates
  const getAgeCategory = (age: number): string => {
    if (age === 18) return '18'
    if (age === 21) return '21'
    if (age === 30) return '30'
    if (age === 40) return '40'
    if (age === 50) return '50'
    if (age >= 60) return '60plus'
    return 'generic'
  }

  // Generate personalized messages
  const generateMessages = useCallback(() => {
    setIsGenerating(true)
    
    // Small delay for visual feedback
    setTimeout(() => {
      const templateKey = occasion?.template as TemplateCategory
      const templates = messageTemplates[templateKey]
      
      if (!templates) {
        // Fallback to custom templates if occasion not found
        const fallbackTemplates = messageTemplates.custom.generic
        const shuffled = [...fallbackTemplates].sort(() => Math.random() - 0.5)
        const personalized = shuffled.slice(0, 4).map(template => 
          template.replace(/\{\{name\}\}/g, recipientName)
        )
        setGeneratedMessages(personalized)
        setIsGenerating(false)
        return
      }

      // Get templates based on occasion type
      let availableTemplates: string[] = []
      
      if (occasion?.template === 'birthday' && recipientAge) {
        // For birthday, use age-specific templates
        const ageCategory = getAgeCategory(recipientAge)
        const ageTemplates = templates[ageCategory as keyof typeof templates] as string[] | undefined
        const genericTemplates = templates['generic' as keyof typeof templates] as string[] | undefined
        
        availableTemplates = [
          ...(ageTemplates || []),
          ...(genericTemplates || [])
        ]
      } else {
        // For other occasions, get all templates from all subcategories
        const allTemplates: string[] = []
        Object.values(templates).forEach((categoryTemplates) => {
          if (Array.isArray(categoryTemplates)) {
            allTemplates.push(...categoryTemplates)
          }
        })
        availableTemplates = allTemplates
      }

      // If no templates found, use generic fallback
      if (availableTemplates.length === 0) {
        availableTemplates = messageTemplates.custom.generic
      }

      // Shuffle and select 3-4 random templates
      const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, Math.min(4, shuffled.length))
      
      // Personalize templates
      const personalized = selected.map(template => {
        let message = template.replace(/\{\{name\}\}/g, recipientName)
        if (recipientAge) {
          message = message.replace(/\{\{age\}\}/g, recipientAge.toString())
        }
        return message
      })

      setGeneratedMessages(personalized)
      setIsGenerating(false)
    }, 300)
  }, [occasion, recipientName, recipientAge])

  // Generate messages on mount
  useEffect(() => {
    generateMessages()
  }, [generateMessages])

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta-100 mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-cream-900 mb-2">
          Choose a Message
        </h2>
        <p className="text-cream-600">
          Select a personalized message for <span className="font-semibold text-terracotta-600">{recipientName}</span>
          {recipientAge && <span className="text-cream-500"> (turning {recipientAge})</span>}
        </p>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin mb-4"></div>
          <p className="text-cream-600">Generating personalized messages...</p>
        </div>
      )}

      {/* Message Options */}
      {!isGenerating && generatedMessages.length > 0 && (
        <div className="space-y-4 mb-8">
          {generatedMessages.map((message, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-cream-200 hover:border-terracotta-300 hover:shadow-md transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Message Preview */}
                <div className="flex-1">
                  <p className="text-cream-800 leading-relaxed text-lg font-medium">
                    "{message}"
                  </p>
                </div>
                
                {/* Select Button */}
                <Button
                  onClick={() => onSelect(message)}
                  variant="primary"
                  size="sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Messages State */}
      {!isGenerating && generatedMessages.length === 0 && (
        <div className="text-center py-12 bg-white/60 rounded-2xl border border-cream-200">
          <p className="text-cream-600 mb-4">No messages found for this occasion.</p>
          <Button onClick={generateMessages} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>

        <Button
          variant="outline"
          onClick={generateMessages}
          disabled={isGenerating}
          className="w-full sm:w-auto"
        >
          <svg 
            className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Shake It Up
        </Button>
      </div>

      {/* Helper Text */}
      <p className="mt-6 text-center text-sm text-cream-500">
        Don't worry — you can edit the message after selecting it
      </p>
    </div>
  )
}

import { useState } from 'react'
import { Button } from './ui/Button'
import type { Occasion } from './OccasionSelector'

interface RecipientInputProps {
  occasion: Occasion | null
  onSubmit: (recipientName: string, recipientAge?: number) => void
  onBack: () => void
}

export function RecipientInput({ occasion, onSubmit, onBack }: RecipientInputProps) {
  const [recipientName, setRecipientName] = useState('')
  const [recipientAge, setRecipientAge] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isBirthday = occasion?.template === 'birthday'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate name
    const trimmedName = recipientName.trim()
    if (!trimmedName) {
      setError('Please enter a recipient name')
      return
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (trimmedName.length > 50) {
      setError('Name must be less than 50 characters')
      return
    }

    // Validate age for birthday
    let age: number | undefined
    if (isBirthday) {
      const ageNum = parseInt(recipientAge, 10)
      if (!recipientAge || isNaN(ageNum)) {
        setError('Please enter a valid age')
        return
      }
      if (ageNum < 1 || ageNum > 120) {
        setError('Please enter an age between 1 and 120')
        return
      }
      age = ageNum
    }

    onSubmit(trimmedName, age)
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setRecipientAge(value)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-cream-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta-100 mb-4">
            <span className="text-3xl">{occasion?.icon || '✉️'}</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-cream-900 mb-2">
            Who is this card for?
          </h2>
          <p className="text-cream-600">
            {occasion?.name 
              ? `Personalize your ${occasion.name.toLowerCase()} message` 
              : 'Personalize your message'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Name */}
          <div>
            <label 
              htmlFor="recipientName" 
              className="block text-sm font-medium text-cream-700 mb-2"
            >
              Recipient Name <span className="text-terracotta-500">*</span>
            </label>
            <input
              type="text"
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter their name..."
              className="w-full px-4 py-3 rounded-xl border-2 border-cream-200 focus:border-terracotta-400 focus:outline-none transition-colors bg-cream-50/50 text-cream-900 placeholder-cream-400"
              autoFocus
            />
          </div>

          {/* Age Input (Birthday only) */}
          {isBirthday && (
            <div className="animate-slide-down">
              <label 
                htmlFor="recipientAge" 
                className="block text-sm font-medium text-cream-700 mb-2"
              >
                How old are they turning? <span className="text-terracotta-500">*</span>
              </label>
              <input
                type="text"
                id="recipientAge"
                value={recipientAge}
                onChange={handleAgeChange}
                placeholder="Enter their age..."
                maxLength={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-cream-200 focus:border-terracotta-400 focus:outline-none transition-colors bg-cream-50/50 text-cream-900 placeholder-cream-400"
              />
              <p className="mt-2 text-sm text-cream-500">
                We'll customize the message based on their age
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="flex-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </form>

        {/* Helper Text */}
        <p className="mt-6 text-center text-sm text-cream-500">
          We'll generate personalized message options based on your answers
        </p>
      </div>
    </div>
  )
}

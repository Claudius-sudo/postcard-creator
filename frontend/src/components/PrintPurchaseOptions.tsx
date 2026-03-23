import { useState } from 'react'
import { Button } from './ui/Button'

interface PrintPurchaseOptionsProps {
  isVisible: boolean
}

export function PrintPurchaseOptions({ isVisible }: PrintPurchaseOptionsProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Simulate print preparation
      await new Promise(resolve => setTimeout(resolve, 800))
      window.print()
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePurchase = async () => {
    setIsPurchasing(true)
    try {
      // Simulate purchase flow
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('JPEG purchase feature coming soon! Your postcard will be available for download.')
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div
      className={`
        fixed inset-0 z-40 flex items-center justify-center p-4
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      style={{
        background: isVisible 
          ? 'linear-gradient(180deg, rgba(253, 248, 243, 0.98) 0%, rgba(250, 243, 234, 0.98) 100%)' 
          : 'transparent'
      }}
    >
      <div
        className={`
          max-w-2xl w-full text-center
          transition-all duration-700 ease-out
          ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}
        `}
        style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}
      >
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta-100 mb-4">
            <svg 
              className="w-8 h-8 text-terracotta-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
              />
            </svg>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-3">
            Your Postcard is Ready!
          </h2>
          <p className="text-cream-600 text-lg max-w-md mx-auto">
            Choose how you'd like to bring your creation to life
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Print Card Option */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="
              group relative p-8 rounded-3xl 
              bg-white border-2 border-cream-200 
              hover:border-terracotta-300 hover:shadow-warm
              transition-all duration-300
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-terracotta-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sage-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-8 h-8 text-sage-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
                  />
                </svg>
              </div>
              
              <h3 className="font-display text-xl font-semibold text-cream-900 mb-2">
                Print Card
              </h3>
              <p className="text-sm text-cream-600 mb-4">
                Send to your printer or save as PDF for professional printing
              </p>
              
              <span className="inline-flex items-center gap-2 text-terracotta-600 font-medium text-sm">
                {isPrinting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Preparing...
                  </>
                ) : (
                  <>
                    Print Now
                    <svg 
                      className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </div>
          </button>

          {/* Purchase JPEG Option */}
          <button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="
              group relative p-8 rounded-3xl 
              bg-gradient-to-br from-terracotta-500 to-terracotta-600
              text-white
              hover:from-terracotta-600 hover:to-terracotta-700
              hover:shadow-[0_12px_40px_-8px_rgba(198,123,92,0.5)]
              transition-all duration-300
              disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              
              <h3 className="font-display text-xl font-semibold mb-2">
                Purchase JPEG
              </h3>
              <p className="text-sm text-white/80 mb-4">
                High-resolution digital file for sharing or printing anywhere
              </p>
              
              <span className="inline-flex items-center gap-2 font-medium text-sm">
                {isPurchasing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Buy $4.99
                    <svg 
                      className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </div>
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-cream-500 text-sm">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Payment
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Instant Download
          </span>
        </div>
      </div>
    </div>
  )
}

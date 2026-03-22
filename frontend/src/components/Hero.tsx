import { Button } from './ui/Button'

interface HeroProps {
  onCreateClick: () => void
}

export function Hero({ onCreateClick }: HeroProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-terracotta-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-golden-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sage-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        {/* Floating Envelope Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 shadow-warm animate-float">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream-900 mb-6 leading-tight">
          Send Warmth,
          <span className="block text-terracotta-600">One Card at a Time</span>
        </h1>

        <p className="text-lg md:text-xl text-cream-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          Create beautiful, personalized postcards that capture your thoughts and feelings. 
          Whether it's a heartfelt thank you, a birthday wish, or just because — 
          make someone's day a little brighter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={onCreateClick} className="w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your Postcard
          </Button>
          
          <Button variant="outline" size="lg" onClick={onCreateClick} className="w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Browse Templates
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {['Easy to use', 'Beautiful templates', 'Instant download', 'Share anywhere'].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-cream-700 shadow-sm"
            >
              ✨ {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

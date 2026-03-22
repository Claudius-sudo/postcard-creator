import { Hero } from '../components/Hero'
import { TemplateGallery } from '../components/templates/TemplateGallery'
import type { PostcardTemplate } from '../types'

interface HomePageProps {
  onNavigate: (page: 'home' | 'create' | 'gallery') => void
  onSelectTemplate: (template: PostcardTemplate) => void
}

export function HomePage({ onNavigate, onSelectTemplate }: HomePageProps) {
  const handleTemplateSelect = (template: PostcardTemplate) => {
    onSelectTemplate(template)
    onNavigate('create')
  }

  return (
    <div className="animate-fade-in">
      <Hero onCreateClick={() => onNavigate('create')} />
      
      {/* Templates Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-4">
              Start with a Template
            </h2>
            <p className="text-cream-600 text-lg max-w-2xl mx-auto">
              Choose from our collection of warm, thoughtfully designed templates to get started quickly.
            </p>
          </div>
          
          <TemplateGallery
            selectedTemplateId={null}
            onSelectTemplate={handleTemplateSelect}
          />
          
          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-medium"
            >
              Or start from scratch
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-900 mb-4">
              Why Create Postcards?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💌',
                title: 'Personal Touch',
                description: 'In a digital world, a personalized postcard shows you truly care.',
              },
              {
                icon: '🎨',
                title: 'Express Creativity',
                description: 'Design something unique that reflects your style and message.',
              },
              {
                icon: '✨',
                title: 'Make Memories',
                description: 'Create keepsakes that can be treasured for years to come.',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display text-xl font-semibold text-cream-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-cream-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

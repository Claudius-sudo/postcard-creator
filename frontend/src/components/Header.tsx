interface HeaderProps {
  onNavigate?: (page: 'home' | 'gallery') => void
  currentPage?: 'home' | 'gallery'
}

export function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 flex items-center justify-center shadow-soft group-hover:shadow-warm transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold text-cream-900">
              Postcard Creator
            </span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: 'Create' },
              { id: 'gallery', label: 'My Cards' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id as 'home' | 'gallery')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${currentPage === item.id
                    ? 'text-terracotta-600 bg-terracotta-50'
                    : 'text-cream-700 hover:text-cream-900 hover:bg-cream-100'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('home')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium rounded-lg transition-all shadow-soft hover:shadow-warm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Card
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-cream-700 hover:text-cream-900 hover:bg-cream-100 rounded-lg"
              onClick={() => {
                const menu = document.getElementById('mobile-menu')
                menu?.classList.toggle('hidden')
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden py-4 border-t border-cream-200">
          <nav className="flex flex-col gap-2">
            {[
              { id: 'home', label: 'Create' },
              { id: 'gallery', label: 'My Cards' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id as 'home' | 'gallery')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors
                  ${currentPage === item.id
                    ? 'text-terracotta-600 bg-terracotta-50'
                    : 'text-cream-700 hover:text-cream-900 hover:bg-cream-100'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

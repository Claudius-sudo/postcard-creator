import { useState, useMemo } from 'react'
import type { ReferenceImage, ReferenceImageType } from '../../types'

const FILTER_TABS: { type: ReferenceImageType | 'all'; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'character', label: 'Characters' },
  { type: 'scene', label: 'Scenes' },
  { type: 'event', label: 'Events' },
  { type: 'style', label: 'Styles' },
]

const TYPE_ICONS: Record<ReferenceImageType, string> = {
  character: '👤',
  scene: '🏞️',
  event: '🎉',
  style: '🎨',
}

interface ReferenceGalleryProps {
  references: ReferenceImage[]
  onDelete: (id: string) => void
  _onUpdateType?: (id: string, type: ReferenceImageType) => void
  accentColor?: string
}

export function ReferenceGallery({
  references,
  onDelete,
  _onUpdateType,
  accentColor = '#C67B5C'
}: ReferenceGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<ReferenceImageType | 'all'>('all')
  const [enlargedImage, setEnlargedImage] = useState<ReferenceImage | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredReferences = useMemo(() => {
    if (activeFilter === 'all') return references
    return references.filter(ref => ref.type === activeFilter)
  }, [references, activeFilter])

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  if (references.length === 0) {
    return (
      <div className="text-center py-8 text-cream-500">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cream-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-cream-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2z" />
          </svg>
        </div>
        <p className="text-sm">No reference images yet</p>
        <p className="text-xs mt-1">Upload images to use as references</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1">
        {FILTER_TABS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeFilter === type
                ? 'bg-terracotta-500 text-white'
                : 'bg-cream-100 text-cream-600 hover:bg-cream-200'
              }
            `}
          >
            {label}
            {type !== 'all' && (
              <span className="ml-1 opacity-70">
                ({references.filter(r => r.type === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reference Grid */}
      {filteredReferences.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {filteredReferences.map((ref) => (
            <div
              key={ref.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-cream-100 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setEnlargedImage(ref)}
            >
              <img
                src={ref.url}
                alt={ref.name}
                className="w-full h-full object-cover"
              />
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{ 
                    backgroundColor: `${accentColor}E6`,
                    color: 'white'
                  }}
                >
                  {TYPE_ICONS[ref.type]} {ref.type}
                </span>
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEnlargedImage(ref)
                  }}
                  className="w-8 h-8 bg-white text-cream-800 rounded-full flex items-center justify-center hover:bg-cream-50 transition-colors"
                  title="View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(ref.id)
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    deleteConfirm === ref.id
                      ? 'bg-red-600 text-white'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={deleteConfirm === ref.id ? 'Click again to confirm' : 'Delete'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-cream-500 text-sm">
          No {activeFilter} references found
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage.url}
              alt={enlargedImage.name}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span 
                    className="text-xs px-2 py-1 rounded-full font-medium capitalize mr-2"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    {TYPE_ICONS[enlargedImage.type]} {enlargedImage.type}
                  </span>
                  <span className="text-white/80 text-sm">{enlargedImage.name}</span>
                </div>
                <button
                  onClick={() => setEnlargedImage(null)}
                  className="text-white/80 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

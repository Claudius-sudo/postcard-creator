import { useState, useRef, useCallback } from 'react'
import { EditorPanel } from '../components/editor/EditorPanel'
import { PostcardPreview } from '../components/editor/PostcardPreview'
import { ExportPanel } from '../components/editor/ExportPanel'
import { ReferenceImageUploader } from '../components/editor/ReferenceImageUploader'
import { ReferenceGallery } from '../components/editor/ReferenceGallery'
import { Button } from '../components/ui/Button'
import { usePostcardDesign } from '../hooks/usePostcardDesign'
import type { PostcardTemplate, ReferenceImageType } from '../types'
import { uploadReferenceImage } from '../api/references'

interface CreatePageProps {
  initialTemplate?: PostcardTemplate | null
  onSave?: (design: ReturnType<typeof usePostcardDesign>['design']) => void
  editingPostcardId?: number | null
}

export function CreatePage({ initialTemplate, onSave, editingPostcardId }: CreatePageProps) {
  const {
    design,
    updateTitle,
    updateMessage,
    updateImage,
    updateFontFamily,
    updateTheme,
    applyTemplate,
    resetDesign,
    addReference,
    removeReference,
    updateReferenceType,
  } = usePostcardDesign(
    initialTemplate
      ? {
          fontFamily: initialTemplate.fontFamily,
          backgroundColor: initialTemplate.backgroundColor,
          textColor: initialTemplate.textColor,
          accentColor: initialTemplate.accentColor,
          templateId: initialTemplate.id,
        }
      : {}
  )

  const [showPreview, setShowPreview] = useState(false)
  const [showReferences, setShowReferences] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleApplyTemplate = (template: PostcardTemplate) => {
    applyTemplate(template.id, {
      backgroundColor: template.backgroundColor,
      textColor: template.textColor,
      accentColor: template.accentColor,
      fontFamily: template.fontFamily,
    })
  }

  const handleReferenceUpload = useCallback(async (
    file: File, 
    type: ReferenceImageType, 
    previewUrl: string
  ) => {
    // Add to local state immediately for UI feedback
    addReference({
      url: previewUrl,
      file,
      type,
      name: file.name,
    })

    // If editing an existing postcard, upload immediately
    if (editingPostcardId) {
      setIsUploading(true)
      try {
        const response = await uploadReferenceImage(file, type, editingPostcardId)
        // Update the reference with the server URL
        // The hook's addReference already added it, so we don't need to do anything else
        console.log('Reference uploaded:', response)
      } catch (error) {
        console.error('Failed to upload reference:', error)
        // Optionally show error toast
      } finally {
        setIsUploading(false)
      }
    }
  }, [addReference, editingPostcardId])

  const handleSave = () => {
    onSave?.(design)
  }

  const referenceCount = design.referenceImages.length

  return (
    <div className="animate-fade-in py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-cream-900">
              Create Your Postcard
            </h1>
            <p className="text-cream-600 mt-1">
              Design something beautiful and personal
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={resetDesign}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Card
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            <EditorPanel
              design={design}
              onUpdateTitle={updateTitle}
              onUpdateMessage={updateMessage}
              onUpdateImage={updateImage}
              onUpdateFont={updateFontFamily}
              onUpdateTheme={updateTheme}
              onApplyTemplate={handleApplyTemplate}
            />

            {/* References Section */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setShowReferences(!showReferences)}
                className="w-full flex items-center justify-between p-6 hover:bg-cream-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${design.accentColor}20` }}
                  >
                    <svg 
                      className="w-5 h-5" 
                      style={{ color: design.accentColor }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-display text-lg font-semibold text-cream-900">
                      References
                    </h3>
                    <p className="text-sm text-cream-500">
                      {referenceCount === 0 
                        ? 'Add character, scene, or style references' 
                        : `${referenceCount} reference${referenceCount !== 1 ? 's' : ''} added`
                      }
                    </p>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-cream-400 transition-transform ${showReferences ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showReferences && (
                <div className="px-6 pb-6 border-t border-cream-100 pt-4">
                  <ReferenceImageUploader
                    onUpload={handleReferenceUpload}
                    accentColor={design.accentColor}
                  />
                  
                  {referenceCount > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-cream-800 mb-3">
                        Uploaded References
                      </h4>
                      <ReferenceGallery
                        references={design.referenceImages}
                        onDelete={removeReference}
                        _onUpdateType={updateReferenceType}
                        accentColor={design.accentColor}
                      />
                    </div>
                  )}

                  {isUploading && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-cream-500">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading references...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-cream-900">
                  Preview
                </h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-terracotta-600 hover:text-terracotta-700"
                >
                  {showPreview ? 'Hide' : 'Show'} Fullscreen
                </button>
              </div>

              <div ref={previewRef}>
                <PostcardPreview design={design} />
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {design.title.length}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Title</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {design.message.length}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Message</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {design.image ? '✓' : '—'}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Image</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {referenceCount}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Refs</p>
                </div>
              </div>

              {/* Export */}
              <div className="mt-6">
                <ExportPanel design={design} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <PostcardPreview design={design} className="shadow-2xl" />
            <p className="text-center text-white/60 mt-4 text-sm">
              Click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

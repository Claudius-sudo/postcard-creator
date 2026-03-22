import React, { useState, useRef } from 'react'
import { EditorPanel } from '../components/editor/EditorPanel'
import { PostcardPreview } from '../components/editor/PostcardPreview'
import { ExportPanel } from '../components/editor/ExportPanel'
import { Button } from '../components/ui/Button'
import { usePostcardDesign } from '../hooks/usePostcardDesign'
import type { PostcardTemplate } from '../types'

interface CreatePageProps {
  initialTemplate?: PostcardTemplate | null
  onSave?: (design: ReturnType<typeof usePostcardDesign>['design']) => void
}

export function CreatePage({ initialTemplate, onSave }: CreatePageProps) {
  const {
    design,
    updateTitle,
    updateMessage,
    updateImage,
    updateFontFamily,
    updateTheme,
    applyTemplate,
    resetDesign,
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
  const previewRef = useRef<HTMLDivElement>(null)

  const handleApplyTemplate = (template: PostcardTemplate) => {
    applyTemplate(template.id, {
      backgroundColor: template.backgroundColor,
      textColor: template.textColor,
      accentColor: template.accentColor,
      fontFamily: template.fontFamily,
    })
  }

  const handleSave = () => {
    onSave?.(design)
  }

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
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {design.title.length}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Title Chars</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {design.message.length}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Message Chars</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-card">
                  <p className="text-2xl font-semibold text-terracotta-600">
                    {design.image ? '✓' : '—'}
                  </p>
                  <p className="text-xs text-cream-500 uppercase tracking-wide">Has Image</p>
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

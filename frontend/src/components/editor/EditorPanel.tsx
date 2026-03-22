import React from 'react'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { ImageUpload } from './ImageUpload'
import { TemplateGallery } from '../templates/TemplateGallery'
import { FONT_OPTIONS, THEME_OPTIONS, POSTCARD_TEMPLATES } from '../../utils/constants'
import type { PostcardDesign, PostcardTemplate } from '../../types'

interface EditorPanelProps {
  design: PostcardDesign
  onUpdateTitle: (title: string) => void
  onUpdateMessage: (message: string) => void
  onUpdateImage: (image: string | null, file: File | null) => void
  onUpdateFont: (font: string) => void
  onUpdateTheme: (bg: string, text: string, accent: string) => void
  onApplyTemplate: (template: PostcardTemplate) => void
}

export function EditorPanel({
  design,
  onUpdateTitle,
  onUpdateMessage,
  onUpdateImage,
  onUpdateFont,
  onUpdateTheme,
  onApplyTemplate,
}: EditorPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'content' | 'style' | 'templates'>('content')

  const handleTemplateSelect = (template: PostcardTemplate) => {
    onApplyTemplate(template)
  }

  const fontOptions = FONT_OPTIONS.map(f => ({
    value: f.family,
    label: f.name,
  }))

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-cream-200">
        {(['content', 'style', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-4 px-4 text-sm font-medium transition-colors
              ${activeTab === tab
                ? 'text-terracotta-600 border-b-2 border-terracotta-500 bg-terracotta-50/50'
                : 'text-cream-600 hover:text-cream-800 hover:bg-cream-50'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-cream-800 mb-2">
                Postcard Image
              </label>
              <ImageUpload
                image={design.image}
                onImageChange={onUpdateImage}
                accentColor={design.accentColor}
              />
            </div>

            <Input
              label="Title"
              value={design.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Enter a title for your postcard"
            />

            <TextArea
              label="Message"
              value={design.message}
              onChange={(e) => onUpdateMessage(e.target.value)}
              placeholder="Write your heartfelt message..."
              rows={5}
            />
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-6 animate-fade-in">
            <Select
              label="Font Style"
              value={design.fontFamily}
              options={fontOptions}
              onChange={onUpdateFont}
            />

            <div>
              <label className="block text-sm font-medium text-cream-800 mb-3">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateTheme(theme.backgroundColor, theme.textColor, theme.accentColor)}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all
                      ${design.backgroundColor === theme.backgroundColor
                        ? 'border-terracotta-500 shadow-soft'
                        : 'border-transparent hover:border-cream-300'
                      }
                    `}
                    style={{ backgroundColor: theme.backgroundColor }}
                  >
                    <p
                      className="font-medium text-sm mb-1"
                      style={{ color: theme.textColor }}
                    >
                      {theme.name}
                    </p>
                    <div className="flex gap-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.textColor}30` }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.textColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-cream-200">
              <p className="text-sm text-cream-600 mb-3">Custom Colors</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-cream-500 mb-1 block">Background</label>
                  <input
                    type="color"
                    value={design.backgroundColor}
                    onChange={(e) => onUpdateTheme(e.target.value, design.textColor, design.accentColor)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-cream-500 mb-1 block">Text</label>
                  <input
                    type="color"
                    value={design.textColor}
                    onChange={(e) => onUpdateTheme(design.backgroundColor, e.target.value, design.accentColor)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-cream-500 mb-1 block">Accent</label>
                  <input
                    type="color"
                    value={design.accentColor}
                    onChange={(e) => onUpdateTheme(design.backgroundColor, design.textColor, e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="animate-fade-in">
            <TemplateGallery
              selectedTemplateId={design.templateId}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>
        )}
      </div>
    </div>
  )
}

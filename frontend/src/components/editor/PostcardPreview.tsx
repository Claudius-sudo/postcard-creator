import React from 'react'
import type { PostcardDesign } from '../../types'

interface PostcardPreviewProps {
  design: PostcardDesign
  className?: string
}

export function PostcardPreview({ design, className = '' }: PostcardPreviewProps) {
  const { title, message, image, fontFamily, backgroundColor, textColor, accentColor } = design

  return (
    <div
      className={`
        relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-warm
        ${className}
      `}
      style={{ backgroundColor }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(${textColor} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col">
        {/* Image Area */}
        {image ? (
          <div className="flex-1 rounded-xl overflow-hidden mb-4">
            <img
              src={image}
              alt="Postcard"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="flex-1 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed"
            style={{ borderColor: `${textColor}30` }}
          >
            <span className="text-6xl opacity-30">✉️</span>
          </div>
        )}

        {/* Text Content */}
        <div className="space-y-2">
          {title && (
            <h2
              className="text-xl font-semibold line-clamp-1"
              style={{ fontFamily, color: textColor }}
            >
              {title}
            </h2>
          )}
          
          {message && (
            <p
              className="text-sm line-clamp-3 opacity-80"
              style={{ fontFamily, color: textColor }}
            >
              {message}
            </p>
          )}

          {/* Decorative Line */}
          <div
            className="w-16 h-1 rounded-full mt-3"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Corner Decoration */}
      <div
        className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-20"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}

import React from 'react'
import { useImageUpload } from '../../hooks/useImageUpload'

interface ImageUploadProps {
  image: string | null
  onImageChange: (image: string | null, file: File | null) => void
  accentColor?: string
}

export function ImageUpload({ image, onImageChange, accentColor = '#C67B5C' }: ImageUploadProps) {
  const {
    isDragging,
    inputRef,
    handleImageSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    clearImage,
  } = useImageUpload(onImageChange)

  if (image) {
    return (
      <div className="relative rounded-2xl overflow-hidden group">
        <img
          src={image}
          alt="Postcard"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-white text-cream-900 rounded-lg font-medium hover:bg-cream-50 transition-colors"
          >
            Change Image
          </button>
          <button
            onClick={clearImage}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? 'border-terracotta-500 bg-terracotta-50'
          : 'border-cream-300 hover:border-terracotta-400 hover:bg-cream-50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      
      <div
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: accentColor }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      
      <p className="text-cream-800 font-medium mb-1">
        {isDragging ? 'Drop your image here' : 'Click or drag to upload'}
      </p>
      <p className="text-cream-500 text-sm">
        Supports JPG, PNG, GIF up to 10MB
      </p>
    </div>
  )
}

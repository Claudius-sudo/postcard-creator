import { useState, useRef, useCallback } from 'react'
import type { ReferenceImageType } from '../../types'

const REFERENCE_TYPES: { type: ReferenceImageType; label: string; icon: string }[] = [
  { type: 'character', label: 'Character', icon: '👤' },
  { type: 'scene', label: 'Scene', icon: '🏞️' },
  { type: 'event', label: 'Event', icon: '🎉' },
  { type: 'style', label: 'Style', icon: '🎨' },
]

interface ReferenceImageUploaderProps {
  onUpload: (file: File, type: ReferenceImageType, previewUrl: string) => void
  accentColor?: string
}

interface UploadingFile {
  id: string
  file: File
  preview: string
  type: ReferenceImageType
  name: string
}

export function ReferenceImageUploader({ 
  onUpload, 
  accentColor = '#C67B5C' 
}: ReferenceImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [selectedType, setSelectedType] = useState<ReferenceImageType>('character')
  const inputRef = useRef<HTMLInputElement>(null)

  const generateId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const newUpload: UploadingFile = {
        id: generateId(),
        file,
        preview: reader.result as string,
        type: selectedType,
        name: file.name,
      }
      setUploadingFiles(prev => [...prev, newUpload])
      onUpload(file, selectedType, reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [selectedType, onUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => processFile(file))
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => processFile(file))
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [processFile])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const removeUpload = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(u => u.id !== id))
  }, [])

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        {REFERENCE_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedType === type
                ? 'bg-terracotta-500 text-white shadow-soft'
                : 'bg-cream-100 text-cream-700 hover:bg-cream-200'
              }
            `}
          >
            <span>{icon}</span>
            <span className="capitalize">{label}</span>
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
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
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: accentColor }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2z"
            />
          </svg>
        </div>
        
        <p className="text-cream-800 font-medium text-sm mb-1">
          {isDragging ? 'Drop images here' : 'Click or drag to upload references'}
        </p>
        <p className="text-cream-500 text-xs">
          Selected type: <span className="font-medium text-terracotta-600 capitalize">{selectedType}</span>
        </p>
      </div>

      {/* Uploading Files Preview */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {uploadingFiles.map((upload) => (
            <div
              key={upload.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-cream-100"
            >
              <img
                src={upload.preview}
                alt={upload.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white text-xs font-medium capitalize bg-black/40 px-2 py-1 rounded">
                    {upload.type}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeUpload(upload.id)
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

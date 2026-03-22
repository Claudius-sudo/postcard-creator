import { useState, useCallback, useRef, useEffect } from 'react'

interface UseImageUploadReturn {
  image: string | null
  file: File | null
  isDragging: boolean
  inputRef: React.RefObject<HTMLInputElement>
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleClick: () => void
  clearImage: () => void
}

export function useImageUpload(onImageChange?: (image: string | null, file: File | null) => void): UseImageUploadReturn {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImage(result)
      setFile(selectedFile)
      onImageChange?.(result, selectedFile)
    }
    reader.readAsDataURL(selectedFile)
  }, [onImageChange])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [processFile])

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
    
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [processFile])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const clearImage = useCallback(() => {
    setImage(null)
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onImageChange?.(null, null)
  }, [onImageChange])

  return {
    image,
    file,
    isDragging,
    inputRef,
    handleImageSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    clearImage,
  }
}

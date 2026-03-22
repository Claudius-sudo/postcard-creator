import { useState, useCallback } from 'react'
import type { PostcardDesign, ReferenceImage, ReferenceImageType } from '../types'
import { DEFAULT_DESIGN } from '../utils/constants'

export function usePostcardDesign(initialDesign: Partial<PostcardDesign> = {}) {
  const [design, setDesign] = useState<PostcardDesign>({
    ...DEFAULT_DESIGN,
    ...initialDesign,
  })

  const updateTitle = useCallback((title: string) => {
    setDesign(prev => ({ ...prev, title }))
  }, [])

  const updateMessage = useCallback((message: string) => {
    setDesign(prev => ({ ...prev, message }))
  }, [])

  const updateImage = useCallback((image: string | null) => {
    setDesign(prev => ({ ...prev, image }))
  }, [])

  const updateFontFamily = useCallback((fontFamily: string) => {
    setDesign(prev => ({ ...prev, fontFamily }))
  }, [])

  const updateTheme = useCallback((backgroundColor: string, textColor: string, accentColor: string) => {
    setDesign(prev => ({ ...prev, backgroundColor, textColor, accentColor }))
  }, [])

  const applyTemplate = useCallback((templateId: string, template: {
    backgroundColor: string
    textColor: string
    accentColor: string
    fontFamily: string
  }) => {
    setDesign(prev => ({
      ...prev,
      templateId,
      backgroundColor: template.backgroundColor,
      textColor: template.textColor,
      accentColor: template.accentColor,
      fontFamily: template.fontFamily,
    }))
  }, [])

  const addReference = useCallback((reference: Omit<ReferenceImage, 'id' | 'createdAt'>) => {
    const newReference: ReferenceImage = {
      ...reference,
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    setDesign(prev => ({
      ...prev,
      referenceImages: [...prev.referenceImages, newReference],
    }))
    return newReference.id
  }, [])

  const removeReference = useCallback((id: string) => {
    setDesign(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter(ref => ref.id !== id),
    }))
  }, [])

  const updateReferenceType = useCallback((id: string, type: ReferenceImageType) => {
    setDesign(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.map(ref =>
        ref.id === id ? { ...ref, type } : ref
      ),
    }))
  }, [])

  const resetDesign = useCallback(() => {
    setDesign(DEFAULT_DESIGN)
  }, [])

  const exportDesign = useCallback(() => {
    return {
      ...design,
      timestamp: new Date().toISOString(),
    }
  }, [design])

  return {
    design,
    updateTitle,
    updateMessage,
    updateImage,
    updateFontFamily,
    updateTheme,
    applyTemplate,
    addReference,
    removeReference,
    updateReferenceType,
    resetDesign,
    exportDesign,
  }
}

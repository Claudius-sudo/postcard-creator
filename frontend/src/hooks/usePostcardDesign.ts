import { useState, useCallback } from 'react'
import type { PostcardDesign, ReferenceImage, ReferenceImageType } from '../types'
import { DEFAULT_DESIGN } from '../utils/constants'
import messageTemplates from '../data/messageTemplates.json'

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

  const updatePictureSide = useCallback((pictureSide: string) => {
    setDesign(prev => ({ ...prev, pictureSide }))
  }, [])

  const updateInnerSide = useCallback((innerSide: string) => {
    setDesign(prev => ({ ...prev, innerSide }))
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

  // Generate random variations for Picture Side and Inner Side
  const generateVariations = useCallback((occasion: string, subcategory: string, recipientName: string) => {
    const templates = messageTemplates as Record<string, Record<string, string[]>>
    
    // Get templates for the occasion
    const occasionTemplates = templates[occasion]
    if (!occasionTemplates) return null

    // Get templates for the subcategory, fallback to generic or first available
    let messages = occasionTemplates[subcategory]
    if (!messages || messages.length === 0) {
      messages = occasionTemplates['generic'] || occasionTemplates[Object.keys(occasionTemplates)[0]]
    }
    if (!messages || messages.length === 0) return null

    // Pick a random message
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    const personalizedMessage = randomMessage.replace(/\{\{name\}\}/g, recipientName)

    // Split into picture side (first sentence/phrase) and inner side (full message)
    // Picture side: Short, punchy headline (first sentence or first 60 chars)
    const sentences = personalizedMessage.split(/[.!?]+/).filter(s => s.trim().length > 0)
    let pictureSide = sentences[0]?.trim() || personalizedMessage.slice(0, 60)
    
    // Limit picture side to 60 chars
    if (pictureSide.length > 60) {
      pictureSide = pictureSide.slice(0, 57) + '...'
    }

    // Inner side: The full message
    const innerSide = personalizedMessage

    return { pictureSide, innerSide }
  }, [])

  return {
    design,
    updateTitle,
    updateMessage,
    updatePictureSide,
    updateInnerSide,
    updateImage,
    updateFontFamily,
    updateTheme,
    applyTemplate,
    addReference,
    removeReference,
    updateReferenceType,
    resetDesign,
    exportDesign,
    generateVariations,
  }
}

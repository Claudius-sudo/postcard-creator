export type ReferenceImageType = 'character' | 'scene' | 'event' | 'style'

export interface ReferenceImage {
  id: string
  url: string
  file: File | null
  type: ReferenceImageType
  name: string
  createdAt: string
}

export interface Postcard {
  id: number
  title: string
  message: string
  image_path: string | null
  recipient_email: string
  created_at: string
  font_family?: string
  theme?: string
  background_color?: string
  text_color?: string
  reference_images?: ReferenceImage[]
}

export interface PostcardTemplate {
  id: string
  name: string
  description: string
  backgroundColor: string
  textColor: string
  accentColor: string
  fontFamily: string
  previewImage?: string
  category: 'nature' | 'minimal' | 'vintage' | 'playful'
}

export interface PostcardDesign {
  title: string
  message: string
  image: string | null
  fontFamily: string
  backgroundColor: string
  textColor: string
  accentColor: string
  templateId: string | null
  referenceImages: ReferenceImage[]
}

export type FontOption = {
  id: string
  name: string
  family: string
  category: 'serif' | 'sans' | 'handwritten'
}

export type ThemeOption = {
  id: string
  name: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

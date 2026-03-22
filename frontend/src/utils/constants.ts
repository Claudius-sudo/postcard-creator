import type { FontOption, ThemeOption, PostcardTemplate } from '../types'

export const FONT_OPTIONS: FontOption[] = [
  { id: 'playfair', name: 'Playfair Display', family: '"Playfair Display", Georgia, serif', category: 'serif' },
  { id: 'inter', name: 'Inter', family: '"Inter", system-ui, sans-serif', category: 'sans' },
  { id: 'caveat', name: 'Caveat (Handwritten)', family: '"Caveat", cursive', category: 'handwritten' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif', category: 'serif' },
  { id: 'system', name: 'System Default', family: 'system-ui, -apple-system, sans-serif', category: 'sans' },
]

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'terracotta',
    name: 'Warm Terracotta',
    backgroundColor: '#FDF0EB',
    textColor: '#5D3323',
    accentColor: '#C67B5C',
  },
  {
    id: 'sage',
    name: 'Calm Sage',
    backgroundColor: '#F4F7F4',
    textColor: '#263826',
    accentColor: '#5A8A5A',
  },
  {
    id: 'cream',
    name: 'Soft Cream',
    backgroundColor: '#FDF8F3',
    textColor: '#6E5C46',
    accentColor: '#D9C09A',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    backgroundColor: '#FDF9F0',
    textColor: '#61461D',
    accentColor: '#D4A03D',
  },
  {
    id: 'dustyrose',
    name: 'Dusty Rose',
    backgroundColor: '#FDF5F5',
    textColor: '#5E2E2E',
    accentColor: '#C76767',
  },
  {
    id: 'charcoal',
    name: 'Modern Charcoal',
    backgroundColor: '#F8F8F8',
    textColor: '#2D2D2D',
    accentColor: '#4A4A4A',
  },
]

export const POSTCARD_TEMPLATES: PostcardTemplate[] = [
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    description: 'A cozy, warm design perfect for heartfelt messages',
    backgroundColor: '#FDF0EB',
    textColor: '#5D3323',
    accentColor: '#C67B5C',
    fontFamily: '"Playfair Display", Georgia, serif',
    category: 'nature',
  },
  {
    id: 'garden-morning',
    name: 'Garden Morning',
    description: 'Fresh and serene like a morning in the garden',
    backgroundColor: '#F4F7F4',
    textColor: '#263826',
    accentColor: '#5A8A5A',
    fontFamily: '"Caveat", cursive',
    category: 'nature',
  },
  {
    id: 'golden-memories',
    name: 'Golden Memories',
    description: 'Capture precious moments with golden warmth',
    backgroundColor: '#FDF9F0',
    textColor: '#61461D',
    accentColor: '#D4A03D',
    fontFamily: '"Playfair Display", Georgia, serif',
    category: 'vintage',
  },
  {
    id: 'simple-elegance',
    name: 'Simple Elegance',
    description: 'Clean and minimal for a modern touch',
    backgroundColor: '#FDF8F3',
    textColor: '#6E5C46',
    accentColor: '#D9C09A',
    fontFamily: '"Inter", system-ui, sans-serif',
    category: 'minimal',
  },
  {
    id: 'rose-petals',
    name: 'Rose Petals',
    description: 'Soft and romantic for special occasions',
    backgroundColor: '#FDF5F5',
    textColor: '#5E2E2E',
    accentColor: '#C76767',
    fontFamily: '"Caveat", cursive',
    category: 'playful',
  },
  {
    id: 'cozy-cabin',
    name: 'Cozy Cabin',
    description: 'Warm and inviting like a winter retreat',
    backgroundColor: '#FAF1DB',
    textColor: '#7A5620',
    accentColor: '#B8862E',
    fontFamily: '"Playfair Display", Georgia, serif',
    category: 'vintage',
  },
]

export const DEFAULT_DESIGN = {
  title: '',
  message: '',
  image: null as string | null,
  fontFamily: '"Playfair Display", Georgia, serif',
  backgroundColor: '#FDF0EB',
  textColor: '#5D3323',
  accentColor: '#C67B5C',
  templateId: null as string | null,
}

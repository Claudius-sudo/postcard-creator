# Postcard Creator - Frontend Redesign

## Overview

The Postcard Creator frontend has been redesigned as a single-page application with an interactive character showcase feature.

## New Components

### 1. SinglePage.tsx
The main single-page layout that combines:
- Hero section with call-to-action
- Character showcase with scroll-triggered animations
- Embedded postcard editor
- Gallery teaser

### 2. CharacterShowcase.tsx
Displays 5 characters that slide in from left and right sides as the user scrolls:
- Uses Intersection Observer for scroll detection
- Characters slide out naturally when scrolling past
- Click any character to see before/after transformation modal

### 3. CharacterCard.tsx
Individual character card with:
- Glassmorphism styling
- Hover effects with scale and shadow
- Style badges (3D Cartoon, Anime, Watercolor, etc.)
- Loading skeleton for images

### 4. PostcardEditor.tsx
Embedded postcard editor with:
- Template selector (Nature, Minimal, Vintage)
- Title and message inputs
- Image upload with preview
- Live preview panel
- Export functionality

## Character Styles

The showcase features 5 different character styles:
1. **Luna** - 3D Cartoon (slides from left)
2. **Kai** - Anime Style (slides from right)
3. **Milo** - Watercolor (slides from left)
4. **Zara** - Digital Art (slides from right)
5. **Oliver** - Pixar Style (slides from left)

## Google Stitch MCP Integration

To generate character illustrations using Google Stitch:

```bash
mcporter call stitch.generate_screen_from_text \
  projectId="YOUR_PROJECT_ID" \
  prompt="3D cartoon character portrait, friendly face, vibrant colors" \
  deviceType="DESKTOP"
```

### Example Prompts for Each Character:

```bash
# Luna - 3D Cartoon
mcporter call stitch.generate_screen_from_text \
  projectId="your-project" \
  prompt="3D cartoon character portrait of a young woman, vibrant colors, friendly smile, Pixar-style rendering, soft lighting, warm terracotta background" \
  deviceType="DESKTOP"

# Kai - Anime Style
mcporter call stitch.generate_screen_from_text \
  projectId="your-project" \
  prompt="Anime style portrait, elegant young man, expressive eyes, soft watercolor background, detailed hair, studio ghibli inspired" \
  deviceType="DESKTOP"

# Milo - Watercolor
mcporter call stitch.generate_screen_from_text \
  projectId="your-project" \
  prompt="Watercolor portrait, artistic style, soft brush strokes, warm earth tones, cream and sage background, gentle expression" \
  deviceType="DESKTOP"

# Zara - Digital Art
mcporter call stitch.generate_screen_from_text \
  projectId="your-project" \
  prompt="Digital art portrait, bold modern style, vibrant colors, clean lines, contemporary illustration, dusty rose accents" \
  deviceType="DESKTOP"

# Oliver - Pixar Style
mcporter call stitch.generate_screen_from_text \
  projectId="your-project" \
  prompt="Pixar style 3D character portrait, charming friendly man, warm lighting, golden hour, detailed textures, cinematic rendering" \
  deviceType="DESKTOP"
```

## Styling

### Color Palette (Nature Distilled)
- **Terracotta**: #C67B5C - Primary accent
- **Cream**: #FDF8F3 - Background
- **Sage**: #5A8A5A - Secondary accent
- **Golden**: #D4A03D - Highlights
- **Dusty Rose**: #C76767 - Tertiary accent

### Animation Timing
- Slide-in duration: 500ms
- Easing: cubic-bezier(0.34, 1.56, 0.64, 1) (spring effect)
- Hover transitions: 300ms
- Modal animation: 300ms ease-out

### Glassmorphism
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.5);
box-shadow: 0 8px 32px rgba(198, 123, 92, 0.15);
```

## Responsive Design

- **Desktop**: Characters on left/right sides, editor in center
- **Tablet**: Reduced character sizes, maintained layout
- **Mobile**: Stacked layout, characters above editor

## Navigation

The app uses hash-based routing:
- `#home` - Single page with editor and character showcase
- `#gallery` - Saved postcards gallery

## File Structure

```
src/
├── components/
│   ├── SinglePage.tsx       # Main single-page layout
│   ├── CharacterShowcase.tsx # Character scroll showcase
│   ├── CharacterCard.tsx     # Individual character card
│   ├── PostcardEditor.tsx    # Embedded editor
│   └── Header.tsx            # Updated navigation
├── pages/
│   └── GalleryPage.tsx       # Gallery (updated links)
├── hooks/
│   └── usePostcardDesign.ts  # Design state management
├── utils/
│   └── constants.ts          # Templates and defaults
└── index.css                 # Updated with new animations
```

## Build

```bash
npm run build
```

The build output goes to `dist/` directory.

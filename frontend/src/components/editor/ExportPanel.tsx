import { useRef, useState } from 'react'
import type { PostcardDesign } from '../../types'

interface ExportPanelProps {
  design: PostcardDesign
}

export function ExportPanel({ design }: ExportPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const generateImage = async (): Promise<string> => {
    const canvas = canvasRef.current
    if (!canvas) throw new Error('Canvas not available')

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    // Set canvas size (postcard ratio 4:3 at high resolution)
    const width = 1200
    const height = 900
    canvas.width = width
    canvas.height = height

    // Fill background
    ctx.fillStyle = design.backgroundColor
    ctx.fillRect(0, 0, width, height)

    // Add subtle pattern
    ctx.fillStyle = design.textColor
    ctx.globalAlpha = 0.03
    for (let x = 0; x < width; x += 30) {
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1

    // Draw image if exists
    if (design.image) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const imgHeight = height * 0.55
          const imgY = 60
          const imgX = 60
          const imgWidth = width - 120
          
          // Draw rounded rectangle for image
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(imgX, imgY, imgWidth, imgHeight, 20)
          ctx.clip()
          ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight)
          ctx.restore()
          resolve()
        }
        img.onerror = reject
        img.src = design.image!
      })
    } else {
      // Draw placeholder
      ctx.strokeStyle = `${design.textColor}30`
      ctx.lineWidth = 4
      ctx.setLineDash([20, 10])
      ctx.strokeRect(60, 60, width - 120, height * 0.55)
      ctx.setLineDash([])
    }

    // Draw title
    if (design.title) {
      ctx.font = `bold 48px ${design.fontFamily}`
      ctx.fillStyle = design.textColor
      ctx.textAlign = 'left'
      ctx.fillText(design.title, 60, height * 0.7)
    }

    // Draw message
    if (design.message) {
      ctx.font = `32px ${design.fontFamily}`
      ctx.fillStyle = design.textColor
      ctx.globalAlpha = 0.8
      
      const maxWidth = width - 120
      const lineHeight = 48
      const words = design.message.split(' ')
      let line = ''
      let y = height * 0.75

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 60, y)
          line = words[i] + ' '
          y += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 60, y)
      ctx.globalAlpha = 1
    }

    // Draw accent line
    ctx.fillStyle = design.accentColor
    ctx.fillRect(60, height - 100, 120, 8)

    // Draw corner decoration
    ctx.beginPath()
    ctx.arc(width - 100, 100, 40, 0, Math.PI * 2)
    ctx.fillStyle = `${design.accentColor}30`
    ctx.fill()

    return canvas.toDataURL('image/png')
  }

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const dataUrl = await generateImage()
      const link = document.createElement('a')
      link.download = `postcard-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export postcard. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    setIsExporting(true)
    try {
      const dataUrl = await generateImage()
      if (navigator.share) {
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], 'postcard.png', { type: 'image/png' })
        
        await navigator.share({
          title: design.title || 'My Postcard',
          text: design.message || 'Check out this postcard I created!',
          files: [file],
        })
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-display text-xl font-semibold text-cream-900 mb-4">
        Export & Share
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-terracotta-500 hover:bg-terracotta-600 disabled:bg-cream-300 text-white font-medium rounded-xl transition-all shadow-soft hover:shadow-warm"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download as PNG
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cream-100 hover:bg-cream-200 text-cream-800 font-medium rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

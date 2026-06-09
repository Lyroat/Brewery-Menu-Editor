const toHex = (r, g, b) =>
  `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

export function extractPalette(dataUrl, crop) {
  return new Promise((resolve) => {
    const img = new Image()
    if (!dataUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 64
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      const sx = crop ? (crop.x / 100) * img.naturalWidth : 0
      const sy = crop ? (crop.y / 100) * img.naturalHeight : 0
      const sw = crop ? (crop.w / 100) * img.naturalWidth : img.naturalWidth
      const sh = crop ? (crop.h / 100) * img.naturalHeight : img.naturalHeight
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)

      const data = ctx.getImageData(0, 0, size, size).data

      const pixels = []
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        const l = (max + min) / 2
        const sat = max === min ? 0 : (max - min) / (l > 127 ? (510 - max - min) : (max + min))
        pixels.push({ r, g, b, sat, l })
      }

      const vibrant = pixels.filter(p => p.sat > 0.25 && p.l > 50 && p.l < 200)
      const dark = pixels.filter(p => p.l > 25 && p.l < 90 && p.sat > 0.1)
      const muted = pixels.filter(p => p.sat > 0.08 && p.sat < 0.6 && p.l > 60 && p.l < 170)

      const avgColor = (arr) => {
        if (arr.length === 0) return null
        const sum = arr.reduce((a, p) => ({ r: a.r + p.r, g: a.g + p.g, b: a.b + p.b }), { r: 0, g: 0, b: 0 })
        return toHex(Math.round(sum.r / arr.length), Math.round(sum.g / arr.length), Math.round(sum.b / arr.length))
      }

      const bucketTop = (arr) => {
        if (arr.length === 0) return null
        const buckets = {}
        for (const p of arr) {
          const qr = Math.round(p.r / 24) * 24
          const qg = Math.round(p.g / 24) * 24
          const qb = Math.round(p.b / 24) * 24
          const key = `${qr},${qg},${qb}`
          buckets[key] = (buckets[key] || 0) + 1 + p.sat * 3
        }
        let best = null, bestScore = 0
        for (const [color, score] of Object.entries(buckets)) {
          if (score > bestScore) { bestScore = score; best = color }
        }
        if (!best) return null
        const [r, g, b] = best.split(',').map(Number)
        return toHex(r, g, b)
      }

      let primary = bucketTop(vibrant)

      if (primary) {
        const pr = parseInt(primary.slice(1, 3), 16)
        const pg = parseInt(primary.slice(3, 5), 16)
        const pb = parseInt(primary.slice(5, 7), 16)
        const lum = (pr * 299 + pg * 587 + pb * 114) / 1000
        if (lum < 40) primary = null
      }

      if (!primary) {
        const sorted = [...pixels].sort((a, b) => b.sat - a.sat)
        const top = sorted.slice(0, Math.max(20, sorted.length * 0.1))
        primary = avgColor(top)
      }

      const secondary = avgColor(muted) || primary
      const darkColor = avgColor(dark) || '#333333'

      resolve({ primary: primary || '#666666', secondary: secondary || '#888888', dark: darkColor })
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

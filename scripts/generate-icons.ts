/**
 * PWA Icon Generator
 * Creates all required icon sizes with Nigerian SafetyAlerts branding
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUTPUT_DIR = path.join(process.cwd(), 'public/icons')

// SafetyAlerts shield icon with Nigerian colors
const createShieldSvg = (size: number) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0fdf4"/>
      <stop offset="100%" style="stop-color:#dcfce7"/>
    </linearGradient>
    <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#008751"/>
      <stop offset="100%" style="stop-color:#006341"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="96" fill="url(#bg-gradient)"/>

  <!-- Shield shape -->
  <path
    d="M256 64 L416 120 L416 256 C416 352 344 424 256 456 C168 424 96 352 96 256 L96 120 Z"
    fill="url(#shield-gradient)"
    stroke="#006341"
    stroke-width="4"
  />

  <!-- Nigerian flag stripes inside shield -->
  <g clip-path="url(#shield-clip)">
    <clipPath id="shield-clip">
      <path d="M256 80 L400 132 L400 256 C400 344 332 408 256 440 C180 408 112 344 112 256 L112 132 Z"/>
    </clipPath>
    <!-- Green stripe -->
    <rect x="112" y="80" width="96" height="400" fill="#008751"/>
    <!-- White stripe -->
    <rect x="208" y="80" width="96" height="400" fill="white"/>
    <!-- Green stripe -->
    <rect x="304" y="80" width="96" height="400" fill="#008751"/>
  </g>

  <!-- Shield outline (on top) -->
  <path
    d="M256 80 L400 132 L400 256 C400 344 332 408 256 440 C180 408 112 344 112 256 L112 132 Z"
    fill="none"
    stroke="white"
    stroke-width="8"
    opacity="0.3"
  />

  <!-- Alert icon in center -->
  <circle cx="256" cy="240" r="48" fill="white" opacity="0.95"/>
  <path
    d="M256 200 L256 248 M256 272 L256 280"
    stroke="#008751"
    stroke-width="12"
    stroke-linecap="round"
  />
</svg>
`

async function generateIcons() {
  console.log('Generating PWA icons with Nigerian SafetyAlerts branding...\n')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Generate each size
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`)
    const svg = createShieldSvg(size)

    try {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(outputPath)

      console.log(`  [OK] icon-${size}.png`)
    } catch (error) {
      console.log(`  [FAIL] icon-${size}.png: ${error}`)
    }
  }

  console.log('\nIcon generation complete!')
  console.log(`Icons saved to: ${OUTPUT_DIR}`)
}

generateIcons().catch(console.error)

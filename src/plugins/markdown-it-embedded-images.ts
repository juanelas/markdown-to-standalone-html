import fs from 'fs'
import MarkdownIt from 'markdown-it'
import { type RenderRule } from 'markdown-it/lib/renderer.mjs'
import path from 'path'
import request from 'sync-request'

export function getImageMimeType (buffer: Buffer): string | null {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('Expected a Buffer')
  }

  // JPEG
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  // PNG
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }

  // GIF
  if (buffer.length >= 6) {
    const header = buffer.toString('ascii', 0, 6)
    if (header === 'GIF87a' || header === 'GIF89a') {
      return 'image/gif'
    }
  }

  // WebP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }

  // BMP
  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return 'image/bmp'
  }

  // TIFF
  if (buffer.length >= 4) {
    if (
      (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
      (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
    ) {
      return 'image/tiff'
    }
  }

  // SVG (text-based)
  const start = buffer.slice(0, 512).toString('utf8').trimStart().toLowerCase()

  if (
    start.startsWith('<svg') ||
    (start.startsWith('<?xml') && start.includes('<svg'))
  ) {
    return 'image/svg+xml'
  }

  return null
}

export default function urlimgToBase64Plugin (md: MarkdownIt, basePath = ''): void {
  const defaultRender = md.renderer.rules.image as RenderRule

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const src = token.attrGet('src')
    if (src !== null && !src.includes(';base64,')) {
      let imgBuf = null
      try {
        imgBuf = fs.readFileSync(path.resolve(basePath, src))
      } catch (error) {
        try {
          imgBuf = getImage(src)
        } catch (error) {
          console.log('Could not get ' + src)
          console.log('Error: ' + (error as string))
        }
      }
      if (imgBuf != null) {
        const imgMimeType = getImageMimeType(imgBuf)
        if (imgMimeType !== null) {
          token.attrSet('src', `data:${imgMimeType};base64,${imgBuf.toString('base64')}`)
        } else {
          console.log('Could not determine MIME type of ' + src)
        }
      }
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}

function getImage (url: string): Buffer {
  const response = request('GET', url)
  if (response.statusCode >= 300) {
    throw new Error(
      'Server responded with status code ' +
        String(response.statusCode) +
        ':\n' +
        response.body.toString()
    )
  }
  return response.body as Buffer
}

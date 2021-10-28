import fs from 'fs'
import path from 'path'
import isSvg from 'is-svg'
import imageType, { ImageTypeResult } from 'image-type'
import request from 'sync-request'
import MarkdownIt from 'markdown-it'
import { RenderRule } from 'markdown-it/lib/renderer'

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
        let imgMimeType = ''
        if (isSvg(imgBuf)) {
          imgMimeType = 'image/svg+xml'
        } else {
          if (imageType(imgBuf) !== null) {
            imgMimeType = (imageType(imgBuf) as ImageTypeResult).mime
          } else {
            console.log('Unknown mime type for ' + src)
          }
        }
        if (imgMimeType !== '') token.attrSet('src', `data:${imgMimeType};base64,${imgBuf.toString('base64')}`)
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

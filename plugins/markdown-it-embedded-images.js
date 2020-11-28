'use strict'

const fs = require('fs')
const path = require('path')
const isSvg = require('is-svg')
const imageType = require('image-type')
const request = require('sync-request')

module.exports = function urlimgToBase64Plugin (md, basePath = '') {
  const defaultRender = md.renderer.rules.image

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const src = token.attrGet('src') || null
    if (src && !src.includes(';base64,')) {
      let imgBuf = null
      try {
        imgBuf = fs.readFileSync(path.resolve(basePath, src))
      } catch (error) {
        try {
          imgBuf = getImage(src)
        } catch (error) {
          console.log('Could not get ' + src)
          console.log('Error: ' + error)
        }
      }
      if (imgBuf) {
        const imgMimeType = isSvg(imgBuf) ? 'image/svg+xml' : imageType(imgBuf).mime
        token.attrSet('src', `data:${imgMimeType};base64,${imgBuf.toString('base64')}`)
      }
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}

function getImage (url) {
  const response = request('GET', url)
  if (response.statusCode >= 300) {
    throw new Error(
      'Server responded with status code ' +
        this.statusCode +
        ':\n' +
        this.body.toString()
    )
  }
  return response.body
}

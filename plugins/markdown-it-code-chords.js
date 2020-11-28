'use strict'

const mdChords = require('markdown-it')({ breaks: true }).use(require('markdown-it-chords'))

module.exports = function codeChords (md) {
  const defaultRender = md.renderer.rules.fence

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]

    if (token.tag === 'code' && token.info === 'song') {
      return `<div class="song">${mdChords.render(token.content)}</song>`
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}

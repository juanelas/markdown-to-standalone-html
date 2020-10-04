'use strict'

const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const mdKatex = require('@traptitech/markdown-it-katex')
const mdAnchor = require('markdown-it-anchor')
const mdToc = require('markdown-toc')
const imageType = require('image-type')
const minify = require('html-minifier').minify
const uslug = require('uslug')

const hljs = require('highlight.js') // https://highlightjs.org/

// full options list (defaults)
const md = MarkdownIt({
  html: false, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />).
  // This is only for full CommonMark compatibility.
  breaks: false, // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-', // CSS language prefix for fenced blocks. Can be
  // useful for external highlighters.
  linkify: false, // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer: false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externaly.
  // If result starts with <pre... internal wrapper is skipped.
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code class="hljs">' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>'
      } catch (__) {}
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

md.use(mdKatex, { throwOnError: true })

function urlimgToBase64 (md) {
  md.core.ruler.push('urlimg-to-base64', state => {
    state.tokens.filter(token => token.type === 'inline').forEach(token => {
      token.children.filter(token => token.type === 'image').forEach(token => {
        const src = token.attrGet('src') || ''
        let imgBuf = null
        try {
          imgBuf = fs.readlinkSync(URL(src))
        } catch (error) {
          imgBuf = fs.readFileSync(src)
        }
        token.attrSet('src', `data:${imageType(imgBuf).mime};base64,${imgBuf.toString('base64')}`)
      })
    })
  })
}
md.use(urlimgToBase64)

md.use(mdAnchor, { level: 2, slugify: uslug })

const defaultTemplate = 'template.html'
const cssBootstrap = fs.readFileSync(path.join(__dirname, '/node_modules/bootstrap/dist/css/bootstrap.css'), 'utf8')
const cssHighlightJs = fs.readFileSync(path.join(__dirname, '/node_modules/highlight.js/styles/vs2015.css'), 'utf8')
const cssKatex = fs.readFileSync(path.join(__dirname, '/node_modules/katex/dist/katex.css'), 'utf8')

const markdownToStandAloneHtml = (mdContents, customTemplate) => {
  const toc = md.render(mdToc(mdContents, { firsth1: false, slugify: uslug }).content)

  const main = md.render(mdContents)

  const regex = /<h1>([^<>]*)<\/h1>/
  const title = main.match(regex) ? main.match(regex)[1] : 'Readme'

  const template = fs.readFileSync(path.join(__dirname, customTemplate || defaultTemplate), 'utf8')

  let output = template.replace('{{CSS}}', cssBootstrap + cssHighlightJs + cssKatex)
    .replace('{{TOC}}', toc)
    .replace('{{MAIN}}', main)
    .replace('{{TITLE}}', title)

  output = minify(output, {
    minifyCSS: true
  })

  return output
}

module.exports = markdownToStandAloneHtml

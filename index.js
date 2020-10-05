'use strict'

const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const mdAnchor = require('markdown-it-anchor')
const mdFigure = require('markdown-it-implicit-figures')
const mdToc = require('markdown-toc')
const imageType = require('image-type')
const isSvg = require('is-svg')
const minify = require('html-minifier').minify
const uslug = require('uslug')

const markdownToStandAloneHtml = (mdContents, { basePath = '.', template = 'template.html', bootstrapCss = true, bootstrapJs = false, highlightjs = true, highlightjsStyle = 'vs2015', katex = true, tocMaxDepth = 6 }) => {
  const mdItOptions = {
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
    quotes: '“”‘’'
  }
  const cssArr = []
  const scriptArr = []
  if (highlightjs) {
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    const hljs = require('highlight.js')
    mdItOptions.highlight = function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre><code class="hljs">' +
            hljs.highlight(lang, str, true).value +
            '</code></pre>'
        } catch (__) { }
      }

      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
    }
    cssArr.push(fs.readFileSync(path.join(__dirname, `/node_modules/highlight.js/styles/${highlightjsStyle}.css`), 'utf8'))
  }
  const md = MarkdownIt(mdItOptions)

  md.use(mdFigure, {
    dataType: false, // <figure data-type="image">, default: false
    figcaption: false, // <figcaption>alternative text</figcaption>, default: false
    tabindex: false, // <figure tabindex="1+n">..., default: false
    link: false // <a href="img.png"><img src="img.png"></a>, default: false
  })

  md.use(mdAnchor, { level: 2, slugify: uslug })

  function urlimgToBase64 (md) {
    md.core.ruler.push('urlimg-to-base64', state => {
      state.tokens.filter(token => token.type === 'inline').forEach(token => {
        token.children.filter(token => token.type === 'image').forEach(token => {
          const src = token.attrGet('src') || ''
          let imgBuf = null
          try {
            imgBuf = fs.readlinkSync(URL(src))
          } catch (error) {
            imgBuf = fs.readFileSync(path.resolve(basePath, src))
          }
          const imgMimeType = isSvg(imgBuf) ? 'image/svg+xml' : imageType(imgBuf).mime
          token.attrSet('src', `data:${imgMimeType};base64,${imgBuf.toString('base64')}`)
        })
      })
    })
  }
  md.use(urlimgToBase64)

  if (katex) {
    const mdKatex = require('@traptitech/markdown-it-katex')
    md.use(mdKatex, { throwOnError: true })

    // Let us embed custom KaTeX fonts in the CSS
    const cssRegex = /url\((.+?)\) format\(['"](.+?)['"]\)/g
    const cssContents = fs.readFileSync(path.join(__dirname, '/node_modules/katex/dist/katex.css'), 'utf8').replace(cssRegex, (match, p1, p2) => {
      const fontFileBuf = fs.readFileSync(path.join(__dirname, '/node_modules/katex/dist', p1))
      return `url(data:font/${p2};base64,${fontFileBuf.toString('base64')})`
    })
    cssArr.push(cssContents)
  }

  if (bootstrapCss) {
    cssArr.push(fs.readFileSync(path.join(__dirname, '/node_modules/bootstrap/dist/css/bootstrap.css'), 'utf8'))

    if (bootstrapJs) {
      scriptArr.push(fs.readFileSync(path.join(__dirname, '/node_modules/jquery/dist/jquery.slim.min.js'), 'utf8'))
      scriptArr.push(fs.readFileSync(path.join(__dirname, '/node_modules/popper.js/dist/popper.min.js'), 'utf8'))
      scriptArr.push(fs.readFileSync(path.join(__dirname, '/node_modules/bootstrap/dist/js/bootstrap.min.js'), 'utf8'))
    }
  }

  const toc = md.render(mdToc(mdContents, { firsth1: false, slugify: uslug, maxdepth: tocMaxDepth }).content)

  const main = md.render(mdContents)

  const titleRegex = /<h1>([^<>]*)<\/h1>/
  const title = main.match(titleRegex) ? main.match(titleRegex)[1] : 'Readme'

  const templateStr = fs.readFileSync(path.join(__dirname, template), 'utf8')

  const css = `<style type="text/css">${cssArr.join('\n')}</style>`

  const script = `<script>${scriptArr.join('\n')}</script>`

  let output = templateStr.replace('<!-- {{CSS}} -->', css)
    .replace('<!-- {{TOC}} -->', toc)
    .replace('<!-- {{MAIN}} -->', main)
    .replace('<!-- {{TITLE}} -->', title)
    .replace('<!-- {{SCRIPT}} -->', script)

  output = minify(output, {
    minifyCSS: true
  })

  return output
}

module.exports = markdownToStandAloneHtml

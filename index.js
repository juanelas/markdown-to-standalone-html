'use strict'

const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const mdFigure = require('markdown-it-implicit-figures')
const minify = require('html-minifier').minify

async function markdownToStandAloneHtml (mdContents, {
  basePath = '.',
  template = './templates/template.html',
  plugins = []
}) {
  const mdItOptions = {
    html: true, // Enable HTML tags in source
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

  let plugin = plugins.find(plugin => plugin.name === 'highlightjs')
  if (plugin) {
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    mdItOptions.highlight = function (str, lang) {
      const hljs = require('highlight.js')
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre><code class="hljs">' +
            hljs.highlight(lang, str, true).value +
            '</code></pre>'
        } catch (__) { }
      }

      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
    }
    cssArr.push(fs.readFileSync(require.resolve(`highlight.js/styles/${plugin.options.theme}.css`), 'utf8'))
  }

  const md = MarkdownIt(mdItOptions)

  md.use(mdFigure, {
    dataType: false, // <figure data-type="image">, default: false
    figcaption: false, // <figcaption>alternative text</figcaption>, default: false
    tabindex: false, // <figure tabindex="1+n">..., default: false
    link: false // <a href="img.png"><img src="img.png"></a>, default: false
  })

  let templateStr = fs.readFileSync(path.join(__dirname, template), 'utf8')

  plugin = plugins.find(plugin => plugin.name === 'toc')
  if (plugin) {
    templateStr = fs.readFileSync(path.join(__dirname, path.dirname(template), `${path.basename(template, '.html')}.toc.html`), 'utf8')
    const mdAnchor = require('markdown-it-anchor')
    const uslug = require('uslug')

    md.use(mdAnchor, { level: 2, slugify: uslug })
    const mdToc = require('markdown-toc')
    const tocContents = md.render(mdToc(mdContents, { firsth1: false, slugify: uslug, maxdepth: plugin.options.tocMaxDepth }).content)
    templateStr = templateStr.replace('<!-- {{TOC_TITLE}} -->', plugin.options.tocTitle)
      .replace('<!-- {{TOC}} -->', tocContents)
  }

  md.use(require('./plugins/markdown-it-embedded-images'), basePath)

  plugin = plugins.find(plugin => plugin.name === 'katex')
  if (plugin) {
    const mdKatex = require('@traptitech/markdown-it-katex')
    md.use(mdKatex, { throwOnError: true })

    // Let us embed custom KaTeX fonts in the CSS
    const cssRegex = /url\((.+?)\) format\(['"](.+?)['"]\)/g
    const cssContents = fs.readFileSync(require.resolve('katex/dist/katex.css'), 'utf8').replace(cssRegex, (match, p1, p2) => {
      const fontFileBuf = fs.readFileSync(path.join(__dirname, '/node_modules/katex/dist', p1))
      return `url(data:font/${p2};base64,${fontFileBuf.toString('base64')})`
    })
    cssArr.push(cssContents)
  }

  plugin = plugins.find(plugin => plugin.name === 'code-chords')
  if (plugin) {
    md.use(require('./plugins/markdown-it-code-chords'))
    cssArr.push(fs.readFileSync(require.resolve('markdown-it-chords/markdown-it-chords.css'), 'utf-8'))
  }

  plugin = plugins.find(plugin => plugin.name === 'bootstrapCss')
  if (plugin) {
    cssArr.push(fs.readFileSync(require.resolve('bootstrap/dist/css/bootstrap.css'), 'utf8'))
  }

  plugin = plugins.find(plugin => plugin.name === 'bootstrapJs')
  if (plugin) {
    const removeMapRegEx = /\/{2}# sourceMappingURL=\S*/g
    scriptArr.push(fs.readFileSync(require.resolve('jquery/dist/jquery.slim.min.js'), 'utf8').replace(removeMapRegEx, ''))
    scriptArr.push(fs.readFileSync(require.resolve('bootstrap/dist/js/bootstrap.bundle.min.js'), 'utf8').replace(removeMapRegEx, ''))
  }

  const main = md.render(mdContents)

  const titleRegex = /<h1>(.+?)<\/h1>/s
  const title = main.match(titleRegex) ? main.match(titleRegex)[1] : 'Readme'

  const css = `<style type="text/css">${cssArr.join('\n')}</style>`

  const script = `<script>\n${scriptArr.join('\n</script>\n<script>\n')}\n</script>`

  templateStr = templateStr.replace('<!-- {{CSS}} -->', css)
    .replace('<!-- {{MAIN}} -->', main)
    .replace('<!-- {{TITLE}} -->', title)
    .replace('<!-- {{SCRIPT}} -->', script)

  const output = minify(templateStr, {
    minifyCSS: true
  })

  return output
}

module.exports = markdownToStandAloneHtml

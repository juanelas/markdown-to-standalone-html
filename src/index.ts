import fs from 'fs'
import path from 'path'
import MarkdownIt from 'markdown-it'
import mdFigure from 'markdown-it-implicit-figures'
import { minify } from 'html-minifier'

import hljs from 'highlight.js'
import mdAnchor from 'markdown-it-anchor'
import uslug from 'uslug'
import mdToc from 'markdown-toc'
import mdImg from './plugins/markdown-it-embedded-images'
import mdKatex from '@traptitech/markdown-it-katex'
import mdChords from './plugins/markdown-it-code-chords'
import mdChordsong from './plugins/markdown-it-chordsong'
import mdOpenLink from './plugins/markdown-it-open-link'

export interface Plugin {
  name: string
  options?: object
}

interface Options {
  basePath: string
  template: string // an absolute path to the template file. Either '.html' or '.toc.html'
  stylesheet: string // an absolute path to the stylesheet file
  plugins: Plugin[]
}

export default async function markdownToStandAloneHtml (mdContents: string, {
  basePath = '.',
  template = path.resolve(__dirname, '..', 'templates', 'template.html'),
  stylesheet = path.resolve(__dirname, '..', 'templates/css', 'template.css'),
  plugins = []
}: Partial<Options>): Promise<string> {
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
  if (plugin !== undefined) {
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    // @ts-expect-error
    mdItOptions.highlight = function (str: string, language?: string) {
      if (language !== undefined && hljs.getLanguage(language) !== undefined) {
        try {
          return '<pre><code class="hljs">' +
            hljs.highlight(str, { language, ignoreIllegals: true }).value +
            '</code></pre>'
        } catch (__) { }
      }
      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
    }
    // @ts-expect-error
    cssArr.push(fs.readFileSync(require.resolve(`highlight.js/styles/${plugin.options.theme as string}.css`), 'utf8'))
  }

  const md = MarkdownIt(mdItOptions)

  md.use(mdFigure, {
    dataType: false, // <figure data-type="image">, default: false
    figcaption: false, // <figcaption>alternative text</figcaption>, default: false
    tabindex: false, // <figure tabindex="1+n">..., default: false
    link: false // <a href="img.png"><img src="img.png"></a>, default: false
  })

  let templateStr: string
  if (template.length > 8 && template.slice(-9) === '.toc.html') {
    template = template.slice(0, template.length - 9) + '.html'
  }

  plugin = plugins.find(plugin => plugin.name === 'toc')
  if (plugin !== undefined) {
    const templateFileWithToc = path.join(path.dirname(template), `${path.basename(template, '.html')}.toc.html`)
    if (!fs.existsSync(templateFileWithToc)) {
      throw new Error(`Can't find template file '${templateFileWithToc}'`)
    }
    templateStr = fs.readFileSync(templateFileWithToc, 'utf8')

    md.use(mdAnchor, { level: 2, slugify: uslug })

    // @ts-expect-error
    const tocContents = md.render(mdToc(mdContents, { firsth1: false, slugify: uslug, maxdepth: plugin.options.tocMaxDepth }).content)
    // @ts-expect-error
    templateStr = templateStr.replace('<!-- {{TOC_TITLE}} -->', plugin.options.tocTitle)
      .replace('<!-- {{TOC}} -->', tocContents)
  } else {
    if (!fs.existsSync(template)) {
      throw new Error(`Can't find template file '${template}'`)
    }
    templateStr = fs.readFileSync(template, 'utf8')
  }

  md.use(mdImg, basePath)

  plugin = plugins.find(plugin => plugin.name === 'katex')
  if (plugin !== undefined) {
    md.use(mdKatex, { throwOnError: true })

    // Let us embed custom KaTeX fonts in the CSS
    const cssRegex = /url\((.+?)\) format\(['"](.+?)['"]\)/g
    const cssContents = fs.readFileSync(require.resolve('katex/dist/katex.css'), 'utf8').replace(cssRegex, (match: string, p1: string, p2: string) => {
      const fontFileBuf = fs.readFileSync(require.resolve(`katex/dist/${p1}`))
      return `url(data:font/${p2};base64,${fontFileBuf.toString('base64')})`
    })
    cssArr.push(cssContents)
  }

  plugin = plugins.find(plugin => plugin.name === 'code-chords')
  if (plugin !== undefined) {
    md.use(mdChords)
    cssArr.push(fs.readFileSync(require.resolve('markdown-it-chords/markdown-it-chords.css'), 'utf-8'))
  }

  plugin = plugins.find(plugin => plugin.name === 'chordsong')
  if (plugin !== undefined) {
    md.use(mdChordsong, cssArr)
  }

  plugin = plugins.find(plugin => plugin.name === 'bootstrapCss')
  if (plugin !== undefined) {
    cssArr.push(fs.readFileSync(require.resolve('bootstrap/dist/css/bootstrap.css'), 'utf8'))
  }

  plugin = plugins.find(plugin => plugin.name === 'bootstrapJs')
  if (plugin !== undefined) {
    const removeMapRegEx = /\/{2}# sourceMappingURL=\S*/g
    scriptArr.push(fs.readFileSync(require.resolve('jquery/dist/jquery.slim.min.js'), 'utf8').replace(removeMapRegEx, ''))
    scriptArr.push(fs.readFileSync(require.resolve('bootstrap/dist/js/bootstrap.bundle.min.js'), 'utf8').replace(removeMapRegEx, ''))
  }

  plugin = plugins.find(plugin => plugin.name == 'open-link')
  if (plugin !== undefined) {
    md.use(mdOpenLink)
  }

  // inline the basic stylesheet
  // TODO: Make this more dynamic
  cssArr.push(fs.readFileSync(require.resolve(stylesheet)))

  const main = md.render(mdContents)

  const titleRegex = /<h1>(.+?)<\/h1>/s
  const titleMatch = main.match(titleRegex)
  const title = (titleMatch !== null) ? titleMatch[1] : 'Readme'

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

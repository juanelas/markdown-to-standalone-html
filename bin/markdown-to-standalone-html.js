#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const pkgJson = require('../package.json')

const markdownToStandAloneHtml = require('../index')

const { program } = require('commander')

program.version(pkgJson.version, '-v, --version', 'output the current version')

program.arguments('<inputfile>')

program.option('-a, --enable-all', 'enable all plugins')
program.option('-A, --disable-all', 'disable all plugins')

program.option('-B, --disable-bootstrap', 'disable embedding the bootstrap CSS in the generated html file')
program.option('-bj, --enable-bootstrap-js', 'enable embedding bootstrap JS files in the generated html file')

program.option('-c, --chords', 'enable support for rendering lyrics with chords using markdown-it-chords. Songs must be placed inside a fenced code block with language \'chords\'. See examples/example.md for details')

program.option('-H, --disable-highlightjs', 'disable syntax highlighting of fenced code blocks with highlight.js')
program.option('-hs, --highlightjs-style <stylename>', 'set the highlight.js style. See https://github.com/highlightjs/highlight.js/tree/master/src/styles', 'vs2015')

program.option('-K, --disable-katex', 'disable math support (prevents embedding the KaTeX CSS and fonts)')

program.option('-o, --output <outputfile>', 'set the output file name. If omitted the output filename is the input one with the extension switched to .html')
program.option('-t, --template <template>', 'force using a user-provided template instead of the default one. Generate two files yourtemplate.html and yourtemplate.toc.html. Take a look to template.html (no toc version) and template.toc.html (TOC version) for inspiration.')

program.option('-d, --toc-max-depth <depth>', 'the TOC will only use headings whose depth is at most maxdepth. A value of 0 disables the TOC', 3)
program.option('--toc-title <title>', 'the title used for the TOC', 'Table of contents')

program.parse(process.argv)

const inputFile = program.args[0]
if (!inputFile) program.help()

let outputFile = program.output
if (!outputFile) {
  const pos = inputFile.lastIndexOf('.')
  outputFile = inputFile.substr(0, pos < 0 ? inputFile.length : pos) + '.html'
}

const mdContents = fs.readFileSync(inputFile, 'utf8')

const plugins = []
if (program.enableAll || (!program.disableAll && !program.disableHighlightjs)) plugins.push({ name: 'highlightjs', options: { theme: program.highlightjsStyle } })
if (program.enableAll || (!program.disableAll && !program.disableBootstrap)) plugins.push({ name: 'bootstrapCss' })
if (program.enableAll || (!program.disableAll && program.enableBootstrapJs)) plugins.push({ name: 'bootstrapJs' })
if (program.enableAll || (!program.disableAll && !program.disableKatex)) plugins.push({ name: 'katex' })
if (!program.disableAll && program.tocMaxDepth > 0) plugins.push({ name: 'toc', options: { tocMaxDepth: program.tocMaxDepth, tocTitle: program.tocTitle } })
if (program.enableAll || (!program.disableAll && program.chords)) plugins.push({ name: 'code-chords' })

const options = {
  basePath: path.dirname(inputFile),
  template: program.template,
  plugins
}

markdownToStandAloneHtml(mdContents, options).then((htmlContents) => {
  fs.writeFile(outputFile, htmlContents, 'utf8', (err) => {
    if (err) throw err
    console.log('Output saved to ' + outputFile)
  })
}).catch((error) => {
  console.log(error)
})

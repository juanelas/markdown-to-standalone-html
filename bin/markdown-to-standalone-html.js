#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')

const markdownToStandAloneHtml = require('../index')

const { program } = require('commander')
program.version('0.0.1')
program.arguments('<inputfile>')
program.option('-o, --output <outputfile>', 'set the output file name. If omitted the output filename is the input one with the extension switched to .html')
program.option('-t, --template <template>', 'force using a user-provided template instead of the default one. Take a look to template.html for inspiration.')
program.option('-B, --disable-bootstrap', 'disable embedding the bootstrap CSS in the generated html file')
program.option('-bj, --enable-bootstrap-js', 'enable embedding bootstrap JS files in the generated html file')
program.option('-K, --disable-katex, --disable-math-support', 'disable math support (prevents embedding the CSS and fonts)')
program.option('-H, --disable-highlightjs', 'disable syntax highlighting of fenced code blocks with highlight.js')
program.option('-hs, --highlightjs-style <themename>', 'set the highlight.js style theme. See https://github.com/highlightjs/highlight.js/tree/master/src/styles')
program.option('-d, --toc-max-depth <depth>', 'the TOC will only use headings whose depth is at most maxdepth')
program.parse(process.argv)

const inputFile = program.args[0]
if (!inputFile) program.help()

let outputFile = program.output
if (!outputFile) {
  const pos = inputFile.lastIndexOf('.')
  outputFile = inputFile.substr(0, pos < 0 ? inputFile.length : pos) + '.html'
}

const mdContents = fs.readFileSync(inputFile, 'utf8')

const htmlContents = markdownToStandAloneHtml(mdContents, { basePath: path.dirname(inputFile), template: program.template, katex: !program.disableKatex, highlightjs: !program.disableHighlightjs, highlightjsStyle: program.highlightjsStyle, bootstrapCss: !program.disableBootstrap, bootstrapJs: program.enableBootstrapJs, tocMaxDepth: program.tocMaxDepth })

fs.writeFileSync(outputFile, htmlContents)

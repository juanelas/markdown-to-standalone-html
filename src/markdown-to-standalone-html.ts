#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
// import pkgJson from '../package.json'
import markdownToStandAloneHtml, { Plugin } from './index'
import { program } from 'commander'
const YAML = require('yaml-front-matter')

const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))

program.showHelpAfterError()

program.version(pkgJson.version, '-v, --version', 'output the current version')

program.description(`${pkgJson.description as string}

Math support is provided with KATEX using standard LaTeX formulae. Surround your LaTeX with a single '$' on each side for inline rendering, or between '$$' for block rendering.

Fenced code blocks are highlighted using [highlight.js](https://highlightjs.org/).

A fenced code block with language 'chordsong' or 'song' can be used to render a song with lyrics and chords using chordsong (https://github.com/juanelas/chordsong). You can alternatively use language 'chords' which will use markdown-it-chords (https://github.com/dnotes/markdown-it-chords) instead.

See example/example.md and its rendered version example/example.html for more help.
`)

program.arguments('<inputfile>')

program.option('-A, --disable-all', 'disable all plugins')

program.option('-B, --disable-bootstrap', 'disable embedding the bootstrap CSS in the generated html file')
program.option('-bj, --enable-bootstrap-js', 'enable embedding bootstrap JS files in the generated html file. It may be useful when using a custom theme')

program.option('-C, --disable-chords', 'disable support for rendering lyrics with chords using chordsong')

program.option('-CC, --disable-code-chords', 'disable support for rendering lyrics with chords using code-chords')

program.option('-H, --disable-highlightjs', 'disable syntax highlighting of fenced code blocks with highlight.js')
program.option('-hs, --highlightjs-style <stylename>', 'set the highlight.js style. See https://github.com/highlightjs/highlight.js/tree/master/src/styles', 'vs2015')

program.option('-K, --disable-katex', 'disable math support (prevents embedding the KaTeX CSS and fonts)')

program.option('-o, --output <outputfile>', 'set the output file name. If omitted the output filename is the input one with the extension switched to .html')

program.option('-OL, --disable-open-link', 'disable opening links in a new tab or window')

program.option('-t, --template <template>', 'force using a user-provided template instead of the default one. Generate two files <template>.html and <template>.toc.html. Take a look to template.html (no toc version) and template.toc.html (TOC version) for inspiration.')

program.option('-d, --toc-max-depth <depth>', 'the TOC will only use headings whose depth is at most maxdepth. A value of 0 disables the TOC', '0')
program.option('--toc-title <title>', 'the title used for the TOC', 'Table of contents')

program.parse(process.argv)

const inputFile: string = program.args[0]

const fileContents = fs.readFileSync(inputFile, 'utf8')
const mdLines = fileContents.split('\n')

// Retrieve the front matter
const yaml = YAML.loadFront(fileContents)

// Remove the front matter if present
const mdContents = mdLines[0] === '---' ? mdLines.slice(mdLines.indexOf('---', 1) + 1).join('\n') : fileContents

const programOptions = program.opts()

let outputFile: string = programOptions.output
if (outputFile === undefined) {
  const pos = inputFile.lastIndexOf('.')
  outputFile = inputFile.slice(0, pos < 0 ? inputFile.length : pos) + '.html'
}

let template: string | undefined
if (yaml.template !== undefined) {
  template = path.resolve(__dirname, '../templates/' + yaml.template + '.html')
} else if (programOptions.template !== undefined) {
  template = path.isAbsolute(programOptions.template)
    ? programOptions.template
    : path.resolve('.', programOptions.template)
} else {
  // template = path.resolve('.', 'templates/basic.html')
  template = path.resolve(__dirname, '../templates/basic.html')
}

const plugins: Plugin[] = []

/* eslint-disable @typescript-eslint/strict-boolean-expressions */
if (!programOptions.disableAll && !programOptions.disableHighlightjs) plugins.push({ name: 'highlightjs', options: { theme: programOptions.highlightjsStyle } })
if (!programOptions.disableAll && !programOptions.disableBootstrap) plugins.push({ name: 'bootstrapCss' })
if (!programOptions.disableAll && programOptions.enableBootstrapJs) plugins.push({ name: 'bootstrapJs' })
if (!programOptions.disableAll && !programOptions.disableKatex) plugins.push({ name: 'katex' })
if (!programOptions.disableAll && !programOptions.disableOpenLink) plugins.push({ name: 'open-link' })
if (!programOptions.disableAll && programOptions.tocMaxDepth > 0) plugins.push({ name: 'toc', options: { tocMaxDepth: Number(programOptions.tocMaxDepth), tocTitle: programOptions.tocTitle } })
if (!programOptions.disableAll && !programOptions.disableChords) plugins.push({ name: 'chordsong' })
if (!programOptions.disableAll && !programOptions.disableCodeChords) plugins.push({ name: 'code-chords' })
/* eslint-enable @typescript-eslint/strict-boolean-expressions */

const options = {
  basePath: path.dirname(inputFile),
  template,
  plugins
}

markdownToStandAloneHtml(mdContents, options).then((htmlContents) => {
  fs.writeFile(outputFile, htmlContents, 'utf8', (err) => {
    if (err != null) throw err
    console.log('Output saved to ' + outputFile)
  })
}).catch((error) => {
  console.error(error)
})

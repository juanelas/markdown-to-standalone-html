'use strict'

const fs = require('fs')

const markdownToStandAloneHtml = require('../index')

const { program } = require('commander')
program.version('0.0.1')
program.arguments('<inputfile>')
program.option('-o, --output <outputfile>', 'Set the output file name. If omitted the output filename is the input one with the extension switched to .html')
program.option('-t, --template <template>', 'Use your user-provided template instead of the default one. Take a look to template.html for inspiration.')
program.parse(process.argv)

const inputFile = program.args[0]
if (!inputFile) program.help()

let outputFile = program.output
if (!outputFile) {
  const pos = inputFile.lastIndexOf('.')
  outputFile = inputFile.substr(0, pos < 0 ? inputFile.length : pos) + '.html'
}

const mdContents = fs.readFileSync(inputFile, 'utf8')

const htmlContents = markdownToStandAloneHtml(mdContents, program.template)

fs.writeFileSync(outputFile, htmlContents)

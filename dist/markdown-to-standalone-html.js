#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./index"));
const commander_1 = require("commander");
const YAML = require('yaml-front-matter');
const pkgJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../package.json'), 'utf8'));
commander_1.program.showHelpAfterError();
commander_1.program.version(pkgJson.version, '-v, --version', 'output the current version');
commander_1.program.description(`${pkgJson.description}

Math support is provided with KATEX using standard LaTeX formulae. Surround your LaTeX with a single '$' on each side for inline rendering, or between '$$' for block rendering.

Fenced code blocks are highlighted using [highlight.js](https://highlightjs.org/).

A fenced code block with language 'chordsong' or 'song' can be used to render a song with lyrics and chords using chordsong (https://github.com/juanelas/chordsong). You can alternatively use language 'chords' which will use markdown-it-chords (https://github.com/dnotes/markdown-it-chords) instead.

See example/example.md and its rendered version example/example.html for more help.
`);
commander_1.program.arguments('<inputfile>');
commander_1.program.option('-A, --disable-all', 'disable all plugins');
commander_1.program.option('-B, --disable-bootstrap', 'disable embedding the bootstrap CSS in the generated html file');
commander_1.program.option('-bj, --enable-bootstrap-js', 'enable embedding bootstrap JS files in the generated html file. It may be useful when using a custom theme');
commander_1.program.option('-C, --disable-chords', 'disable support for rendering lyrics with chords using chordsong');
commander_1.program.option('-CC, --disable-code-chords', 'disable support for rendering lyrics with chords using code-chords');
commander_1.program.option('-H, --disable-highlightjs', 'disable syntax highlighting of fenced code blocks with highlight.js');
commander_1.program.option('-hs, --highlightjs-style <stylename>', 'set the highlight.js style. See https://github.com/highlightjs/highlight.js/tree/master/src/styles', 'vs2015');
commander_1.program.option('-K, --disable-katex', 'disable math support (prevents embedding the KaTeX CSS and fonts)');
commander_1.program.option('-o, --output <outputfile>', 'set the output file name. If omitted the output filename is the input one with the extension switched to .html');
commander_1.program.option('-OL, --disable-open-link', 'disable opening links in a new tab or window');
commander_1.program.option('-t, --template <template>', 'force using a user-provided template instead of the default one. Generate two files <template>.html and <template>.toc.html. Take a look to template.html (no toc version) and template.toc.html (TOC version) for inspiration.');
commander_1.program.option('-d, --toc-max-depth <depth>', 'the TOC will only use headings whose depth is at most maxdepth. A value of 0 disables the TOC', '0');
commander_1.program.option('--toc-title <title>', 'the title used for the TOC', 'Table of contents');
commander_1.program.parse(process.argv);
const inputFile = commander_1.program.args[0];
const fileContents = fs_1.default.readFileSync(inputFile, 'utf8');
const mdLines = fileContents.split('\n');
const yaml = YAML.loadFront(fileContents);
const mdContents = mdLines[0] === '---' ? mdLines.slice(mdLines.indexOf('---', 1) + 1).join('\n') : fileContents;
const programOptions = commander_1.program.opts();
let outputFile = programOptions.output;
if (outputFile === undefined) {
    const pos = inputFile.lastIndexOf('.');
    outputFile = inputFile.slice(0, pos < 0 ? inputFile.length : pos) + '.html';
}
let template;
if (yaml.template !== undefined) {
    template = path_1.default.resolve('./node_modules/accontent-templates/templates/' + yaml.template + '.html');
}
else if (programOptions.template !== undefined) {
    template = path_1.default.isAbsolute(programOptions.template)
        ? programOptions.template
        : path_1.default.resolve('.', programOptions.template);
}
else if (fs_1.default.existsSync(path_1.default.resolve('./node_modules/accontent-templates/templates/basic.html'))) {
    template = path_1.default.resolve('./node_modules/accontent-templates/templates/basic.html');
}
else {
    template = path_1.default.resolve(__dirname, '../templates/template.html');
}
const plugins = [];
if (!programOptions.disableAll && !programOptions.disableHighlightjs)
    plugins.push({ name: 'highlightjs', options: { theme: programOptions.highlightjsStyle } });
if (!programOptions.disableAll && !programOptions.disableBootstrap)
    plugins.push({ name: 'bootstrapCss' });
if (!programOptions.disableAll && programOptions.enableBootstrapJs)
    plugins.push({ name: 'bootstrapJs' });
if (!programOptions.disableAll && !programOptions.disableKatex)
    plugins.push({ name: 'katex' });
if (!programOptions.disableAll && !programOptions.disableOpenLink)
    plugins.push({ name: 'open-link' });
if (!programOptions.disableAll && programOptions.tocMaxDepth > 0)
    plugins.push({ name: 'toc', options: { tocMaxDepth: Number(programOptions.tocMaxDepth), tocTitle: programOptions.tocTitle } });
if (!programOptions.disableAll && !programOptions.disableChords)
    plugins.push({ name: 'chordsong' });
if (!programOptions.disableAll && !programOptions.disableCodeChords)
    plugins.push({ name: 'code-chords' });
const options = {
    basePath: path_1.default.dirname(inputFile),
    template,
    plugins
};
(0, index_1.default)(mdContents, options).then((htmlContents) => {
    fs_1.default.writeFile(outputFile, htmlContents, 'utf8', (err) => {
        if (err != null)
            throw err;
        console.log('Output saved to ' + outputFile);
    });
}).catch((error) => {
    console.error(error);
});
//# sourceMappingURL=markdown-to-standalone-html.js.map
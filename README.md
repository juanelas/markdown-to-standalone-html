# markdown-to-standalone-html

Markdown to standalone HTML converter. It generates a standalone HTML with all CSS and images embedded. A browsable TOC is automatically generated, a Bootstrap 4 layout is used to create a simple but responsive page display, math syntax is supported through (KATEX), and code syntax highlighting through highlight.js.

Install global with:

```console
npm i -g markdown-to-standalone-html
```

```text
Usage: markdown-to-standalone-html [options] <inputfile>

Options:
  -v, --version                         output the current version
  -A, --disable-all                     disable all plugins
  -B, --disable-bootstrap               disable embedding the bootstrap CSS in
                                        the generated html file
  -bj, --enable-bootstrap-js            enable embedding bootstrap JS files in
                                        the generated html file. It may be
                                        useful when using a custom theme
  -C, --disable-chords                  disable support for rendering lyrics
                                        with chords using chordsong
  -CC, --disable-code-chords            disable support for rendering lyrics
                                        with chords using code-chords
  -H, --disable-highlightjs             disable syntax highlighting of fenced
                                        code blocks with highlight.js
  -hs, --highlightjs-style <stylename>  set the highlight.js style. See
                                        https://github.com/highlightjs/highlight.js/tree/master/src/styles
                                        (default: "vs2015")
  -K, --disable-katex                   disable math support (prevents
                                        embedding the KaTeX CSS and fonts)
  -o, --output <outputfile>             set the output file name. If omitted
                                        the output filename is the input one
                                        with the extension switched to .html
  -t, --template <template>             force using a user-provided template
                                        instead of the default one. Generate
                                        two files yourtemplate.html and
                                        yourtemplate.toc.html. Take a look to
                                        template.html (no toc version) and
                                        template.toc.html (TOC version) for
                                        inspiration.
  -d, --toc-max-depth <depth>           the TOC will only use headings whose
                                        depth is at most maxdepth. A value of 0
                                        disables the TOC (default: "3")
  --toc-title <title>                   the title used for the TOC (default:
                                        "Table of contents")
  -h, --help                            display help for command
```

## Examples

See [example.md](./example/example.md) and its rendered version [example.html](./example/example.html)

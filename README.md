# markdown-to-standalone-html

Markdown to standalone HTML converter. It generates a standalone HTML with all CSS and images embedded. A browsable TOC is automatically generated, a Bootstrap 4 layout is used to create a simple but responsive page display, math syntax is supported through (KATEX), and code syntax highlighting through highlight.js.

Install global with:
```console
npm i -g markdown-to-standalone-html
```

```text
Usage: markdown-to-standalone-html [options] <inputfile>

Options:
  -V, --version                                output the version number
  -o, --output <outputfile>                    set the output file name. If omitted the
                                               output filename is the input one with the
                                               extension switched to .html
  -t, --template <template>                    force using a user-provided template
                                               instead of the default one. Take a look to
                                               template.html for inspiration.
  -B, --disable-bootstrap                      disable embedding the bootstrap CSS in the
                                               generated html file
  -bj, --enable-bootstrap-js                   enable embedding bootstrap JS files in the
                                               generated html file
  -K, --disable-katex, --disable-math-support  disable math support (prevents embedding
                                               the CSS and fonts)
  -H, --disable-highlightjs                    disable syntax highlighting of fenced code
                                               blocks with highlight.js
  -hs, --highlightjs-style <themename>         set the highlight.js style theme. See
                                               https://github.com/highlightjs/highlight.js/tree/master/src/styles
  -d, --toc-max-depth <depth>                  the TOC will only use headings whose depth
                                               is at most maxdepth
  -h, --help                                   display help for command
```

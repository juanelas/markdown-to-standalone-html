# markdown-to-standalone-html

Markdown to standalone HTML converter. It generates a standalone HTML with all CSS and images embedded. A browsable TOC is automatically generated, a Bootstrap 4 layout is used to create a simple but responsive page display, math syntax is supported through (KATEX), and code syntax highlighting through highlight.js.

```text
Usage: markdown-to-standalone-html [options] <inputfile>

Options:
  -V, --version              output the version number
  -o, --output <outputfile>  Set the output file name. If omitted the output filename is the input one with the extension switched to .html
  -t, --template <template>  Use your user-provided template instead of the default one. Take a look to template.html for inspiration.
  -h, --help                 display help for command
```

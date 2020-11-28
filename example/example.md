# Examples

## Embedded images

The following online image in your markdown source will be embedded in the generated html with Base64

![Homer Simpson](http://pngimg.com/uploads/simpsons/simpsons_PNG5.png)

The following local image in your markdown source will be embedded in the generated html
![Homer Simpson](./futurama_PNG15.png)

## Some text with LaTeX-like formulae using KaTeX

Surround your LaTeX with a single `$` on each side for inline rendering.
Use two `$$` for block rendering. This mode uses bigger symbols and centres the result.

This is an inline LaTeX-like formula $c=m^e \mod n$ describing textbook RSA encryption.

And this is a block formula:

$$f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi$$

## Highlighted code

The following code will be highlighted with [highlight.js](https://highlightjs.org/). Default style is 'vs2015' but you can choose any [highlight.js style](https://github.com/highlightjs/highlight.js/tree/master/src/styles) passing the name to the command with `--highlightjs-style <stylename>`.

```javascript
'use strict'

const mdChords = require('markdown-it')({ breaks: true }).use(require('markdown-it-chords'))

module.exports = function chords (md) {
  const defaultRender = md.renderer.rules.fence

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]

    if (token.tag === 'code' && token.info === 'song') {
      return `<div class="song">${mdChords.render(token.content)}</song>`
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}
```

## Song lyrics with chords

You can also render songs (lyrics with chords) using [markdown-it-chords](https://github.com/dnotes/markdown-it-chords). For compatibility reasons, only songs in fenced code blocks with language `song` will be rendered.

```song
[C]Do, a deer, a female deer
[Dm]Ray, a drop of golden sun
[Eb]May, a possi[D#]bility
[D/F#]Fee, the price you pay to run
```

```song
(half-time, bossanova guitar)
[CΔ913]So, — I'd [C6]like to see Bra[Fmaj9]zil . . . . .[F6(9)]
[E-7b13]La, — I'd [CM7sus2]really like to [E9]go . . .[E7b9]
[AmΔ7/9]Tea, — I [A-7]sit and sip so [D#ø7]slow . . .[D#o7]
That will [Dm7|x57565]bring — [F6(9)|x87788]us —— [Em7|x79787]back — [G13|x,10,x,12,12,12]to —— [8xx987]Do . . . .[8,8,10,9,10,x]
```

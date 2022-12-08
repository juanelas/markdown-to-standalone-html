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

You can also render songs (lyrics with chords) using [chordsong](https://github.com/juanelas/chordsong) or [markdown-it-chords](https://github.com/dnotes/markdown-it-chords).

Rendering a song involves writting it a a fenced code block with language set to :

- `song` or `chordsong` for [chordsong](https://github.com/juanelas/chordsong)
- `chords` for [markdown-it-chords](https://github.com/dnotes/markdown-it-chords)

### A song using chordsong

```chordsong
{title: Lucía}
{artist: Rosario}
{composer: Joan Manuel Serrat}
{capo: 4th fret}
{tempo: 4/4 83 bpm}
{columns: 1}

Am[x02210]
Am/C[x32210]
Bm7b5[x2323x]
Eaug[0xx11x]
E7[020100]
Asus2/G[302200]
Dm6/F[1x020x]
E7sus4[020200]

              Am 
Vuela esta canción
Am/C          Bm7b5
   para ti, Lucía,
Eaug  E7          Am        Asus2/G
  la más bella historia de amor
    Dm6/F      E7sus4 E7
que tuve y tendré.

```

### A song using markdown-it-chords

```chords
[C]Do, a deer, a female deer
[Dm]Ray, a drop of golden sun
[Eb]May, a possi[D#]bility
[D/F#]Fee, the price you pay to run
```

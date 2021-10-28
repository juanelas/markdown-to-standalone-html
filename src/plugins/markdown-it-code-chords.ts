import MarkdownIt from 'markdown-it'
import mdItChords from 'markdown-it-chords'
import { RenderRule } from 'markdown-it/lib/renderer'

const mdChords = MarkdownIt({ breaks: true }).use(mdItChords)

export default function codeChords (md: MarkdownIt): void {
  const defaultRender = md.renderer.rules.fence as RenderRule

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]

    if (token.tag === 'code' && token.info === 'chords') {
      return `<song>${mdChords.render(token.content)}</song>`
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}

import MarkdownIt from 'markdown-it'
import { RenderRule } from 'markdown-it/lib/renderer'
import chordsong, { SongParts } from 'chordsong'

export default function chordsongPlugin (md: MarkdownIt, cssArr: string[]): void {
  const defaultRender = md.renderer.rules.fence as RenderRule

  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx]

    if (token.tag === 'code' && (token.info === 'song' || token.info === 'chordsong')) {
      const song = chordsong(token.content, undefined, undefined, false) as SongParts
      if (!cssArr.includes(song.css)) cssArr.push(song.css)
      return `<song>${song.content}</song>`
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self)
  }
}

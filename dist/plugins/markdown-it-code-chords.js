"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_it_1 = __importDefault(require("markdown-it"));
const markdown_it_chords_1 = __importDefault(require("markdown-it-chords"));
const mdChords = (0, markdown_it_1.default)({ breaks: true }).use(markdown_it_chords_1.default);
function codeChords(md) {
    const defaultRender = md.renderer.rules.fence;
    md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        if (token.tag === 'code' && token.info === 'chords') {
            return `<song>${mdChords.render(token.content)}</song>`;
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
exports.default = codeChords;
//# sourceMappingURL=markdown-it-code-chords.js.map
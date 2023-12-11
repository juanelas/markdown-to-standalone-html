"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chordsong_1 = __importDefault(require("chordsong"));
function chordsongPlugin(md, cssArr) {
    const defaultRender = md.renderer.rules.fence;
    md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        if (token.tag === 'code' && (token.info === 'song' || token.info === 'chordsong')) {
            const song = (0, chordsong_1.default)(token.content, undefined, undefined, false);
            if (!cssArr.includes(song.css))
                cssArr.push(song.css);
            return `<song>${song.content}</song>`;
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
exports.default = chordsongPlugin;
//# sourceMappingURL=markdown-it-chordsong.js.map
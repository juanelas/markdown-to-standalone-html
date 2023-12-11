"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const is_svg_1 = __importDefault(require("is-svg"));
const image_type_1 = __importDefault(require("image-type"));
const sync_request_1 = __importDefault(require("sync-request"));
function urlimgToBase64Plugin(md, basePath = '') {
    const defaultRender = md.renderer.rules.image;
    md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const src = token.attrGet('src');
        if (src !== null && !src.includes(';base64,')) {
            let imgBuf = null;
            try {
                imgBuf = fs_1.default.readFileSync(path_1.default.resolve(basePath, src));
            }
            catch (error) {
                try {
                    imgBuf = getImage(src);
                }
                catch (error) {
                    console.log('Could not get ' + src);
                    console.log('Error: ' + error);
                }
            }
            if (imgBuf != null) {
                let imgMimeType = '';
                if ((0, is_svg_1.default)(imgBuf)) {
                    imgMimeType = 'image/svg+xml';
                }
                else {
                    if ((0, image_type_1.default)(imgBuf) !== null) {
                        imgMimeType = (0, image_type_1.default)(imgBuf).mime;
                    }
                    else {
                        console.log('Unknown mime type for ' + src);
                    }
                }
                if (imgMimeType !== '')
                    token.attrSet('src', `data:${imgMimeType};base64,${imgBuf.toString('base64')}`);
            }
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
exports.default = urlimgToBase64Plugin;
function getImage(url) {
    const response = (0, sync_request_1.default)('GET', url);
    if (response.statusCode >= 300) {
        throw new Error('Server responded with status code ' +
            String(response.statusCode) +
            ':\n' +
            response.body.toString());
    }
    return response.body;
}
//# sourceMappingURL=markdown-it-embedded-images.js.map
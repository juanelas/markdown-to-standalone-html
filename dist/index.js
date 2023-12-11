"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const markdown_it_implicit_figures_1 = __importDefault(require("markdown-it-implicit-figures"));
const html_minifier_1 = require("html-minifier");
const highlight_js_1 = __importDefault(require("highlight.js"));
const markdown_it_anchor_1 = __importDefault(require("markdown-it-anchor"));
const uslug_1 = __importDefault(require("uslug"));
const markdown_toc_1 = __importDefault(require("markdown-toc"));
const markdown_it_embedded_images_1 = __importDefault(require("./plugins/markdown-it-embedded-images"));
const markdown_it_katex_1 = __importDefault(require("@traptitech/markdown-it-katex"));
const markdown_it_code_chords_1 = __importDefault(require("./plugins/markdown-it-code-chords"));
const markdown_it_chordsong_1 = __importDefault(require("./plugins/markdown-it-chordsong"));
const markdown_it_open_link_1 = __importDefault(require("./plugins/markdown-it-open-link"));
async function markdownToStandAloneHtml(mdContents, { basePath = '.', template = path_1.default.resolve(__dirname, '..', 'templates', 'template.html'), plugins = [] }) {
    const mdItOptions = {
        html: true,
        xhtmlOut: false,
        breaks: false,
        langPrefix: 'language-',
        linkify: false,
        typographer: false,
        quotes: '“”‘’'
    };
    const cssArr = [];
    const scriptArr = [];
    let plugin = plugins.find(plugin => plugin.name === 'highlightjs');
    if (plugin !== undefined) {
        mdItOptions.highlight = function (str, language) {
            if (language !== undefined && highlight_js_1.default.getLanguage(language) !== undefined) {
                try {
                    return '<pre><code class="hljs">' +
                        highlight_js_1.default.highlight(str, { language, ignoreIllegals: true }).value +
                        '</code></pre>';
                }
                catch (__) { }
            }
            return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
        };
        cssArr.push(fs_1.default.readFileSync(require.resolve(`highlight.js/styles/${plugin.options.theme}.css`), 'utf8'));
    }
    const md = (0, markdown_it_1.default)(mdItOptions);
    md.use(markdown_it_implicit_figures_1.default, {
        dataType: false,
        figcaption: false,
        tabindex: false,
        link: false
    });
    let templateStr;
    if (template.length > 8 && template.slice(-9) === '.toc.html') {
        template = template.slice(0, template.length - 9) + '.html';
    }
    plugin = plugins.find(plugin => plugin.name === 'toc');
    if (plugin !== undefined) {
        const templateFileWithToc = path_1.default.join(path_1.default.dirname(template), `${path_1.default.basename(template, '.html')}.toc.html`);
        if (!fs_1.default.existsSync(templateFileWithToc)) {
            throw new Error(`Can't find template file '${templateFileWithToc}'`);
        }
        templateStr = fs_1.default.readFileSync(templateFileWithToc, 'utf8');
        md.use(markdown_it_anchor_1.default, { level: 2, slugify: uslug_1.default });
        const tocContents = md.render((0, markdown_toc_1.default)(mdContents, { firsth1: false, slugify: uslug_1.default, maxdepth: plugin.options.tocMaxDepth }).content);
        templateStr = templateStr.replace('<!-- {{TOC_TITLE}} -->', plugin.options.tocTitle)
            .replace('<!-- {{TOC}} -->', tocContents);
    }
    else {
        if (!fs_1.default.existsSync(template)) {
            throw new Error(`Can't find template file '${template}'`);
        }
        templateStr = fs_1.default.readFileSync(template, 'utf8');
    }
    md.use(markdown_it_embedded_images_1.default, basePath);
    plugin = plugins.find(plugin => plugin.name === 'katex');
    if (plugin !== undefined) {
        md.use(markdown_it_katex_1.default, { throwOnError: true });
        const cssRegex = /url\((.+?)\) format\(['"](.+?)['"]\)/g;
        const cssContents = fs_1.default.readFileSync(require.resolve('katex/dist/katex.css'), 'utf8').replace(cssRegex, (match, p1, p2) => {
            const fontFileBuf = fs_1.default.readFileSync(require.resolve(`katex/dist/${p1}`));
            return `url(data:font/${p2};base64,${fontFileBuf.toString('base64')})`;
        });
        cssArr.push(cssContents);
    }
    plugin = plugins.find(plugin => plugin.name === 'code-chords');
    if (plugin !== undefined) {
        md.use(markdown_it_code_chords_1.default);
        cssArr.push(fs_1.default.readFileSync(require.resolve('markdown-it-chords/markdown-it-chords.css'), 'utf-8'));
    }
    plugin = plugins.find(plugin => plugin.name === 'chordsong');
    if (plugin !== undefined) {
        md.use(markdown_it_chordsong_1.default, cssArr);
    }
    plugin = plugins.find(plugin => plugin.name === 'bootstrapCss');
    if (plugin !== undefined) {
        cssArr.push(fs_1.default.readFileSync(require.resolve('bootstrap/dist/css/bootstrap.css'), 'utf8'));
    }
    plugin = plugins.find(plugin => plugin.name === 'bootstrapJs');
    if (plugin !== undefined) {
        const removeMapRegEx = /\/{2}# sourceMappingURL=\S*/g;
        scriptArr.push(fs_1.default.readFileSync(require.resolve('jquery/dist/jquery.slim.min.js'), 'utf8').replace(removeMapRegEx, ''));
        scriptArr.push(fs_1.default.readFileSync(require.resolve('bootstrap/dist/js/bootstrap.bundle.min.js'), 'utf8').replace(removeMapRegEx, ''));
    }
    plugin = plugins.find(plugin => plugin.name == 'open-link');
    if (plugin !== undefined) {
        md.use(markdown_it_open_link_1.default);
    }
    const main = md.render(mdContents);
    const titleRegex = /<h1>(.+?)<\/h1>/s;
    const titleMatch = main.match(titleRegex);
    const title = (titleMatch !== null) ? titleMatch[1] : 'Readme';
    const css = `<style type="text/css">${cssArr.join('\n')}</style>`;
    const script = `<script>\n${scriptArr.join('\n</script>\n<script>\n')}\n</script>`;
    templateStr = templateStr.replace('<!-- {{CSS}} -->', css)
        .replace('<!-- {{MAIN}} -->', main)
        .replace('<!-- {{TITLE}} -->', title)
        .replace('<!-- {{SCRIPT}} -->', script);
    const output = (0, html_minifier_1.minify)(templateStr, {
        minifyCSS: true
    });
    return output;
}
exports.default = markdownToStandAloneHtml;
//# sourceMappingURL=index.js.map
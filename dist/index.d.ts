export interface Plugin {
    name: string;
    options?: object;
}
interface Options {
    basePath: string;
    template: string;
    stylesheet: string;
    plugins: Plugin[];
}
export default function markdownToStandAloneHtml(mdContents: string, { basePath, template, stylesheet, plugins }: Partial<Options>): Promise<string>;
export {};

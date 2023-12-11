#!/usr/bin/node
declare const path: any;
declare const fs: any;
declare const exec: any;
declare const YAML: any;
declare const ignore: string[];
declare function unslugify(file: string): string;
declare function getFiles(dirPath: string, arrayOfFiles?: Array<string>): string[];
declare function convertFiles(files: Array<string>, srcFolder: string, distFolder: string): void;
declare function convertFile(inputPath: string, outputPath: string): void;
declare const docsPath: any;
declare const distPath: any;
declare const files: string[];

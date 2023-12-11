#!/usr/bin/node
"use strict";
const path = require('path');
const fs = require('fs');
const { exec } = require("child_process");
const YAML = require('yaml-front-matter');
const ignore = ['.', '..', '.DS_Store', '.gitkeep', '.gitignore'];
function unslugify(file) {
    file = file.replace(/-/g, ' ');
    return file.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function getFiles(dirPath, arrayOfFiles = []) {
    let files = fs.readdirSync(dirPath);
    const distPath = dirPath.replace('docs/', 'dist/');
    console.log(distPath);
    exec(`mkdir ${distPath}`);
    files.filter((file) => !ignore.includes(file)).forEach(function (file) {
        console.log(dirPath);
        if (fs.lstatSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getFiles(dirPath + '/' + file, arrayOfFiles);
        }
        else if (fs.lstatSync(dirPath + '/' + file).isFile() && file.endsWith('.md')) {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}
function convertFiles(files, srcFolder, distFolder) {
    files.forEach(file => {
        const inputPath = file;
        const outputPath = file.replace(srcFolder, distFolder).replace('.md', '.html');
        convertFile(inputPath, outputPath);
    });
}
function convertFile(inputPath, outputPath) {
    fs.readFile(inputPath, 'utf8', function (err, fileContents) {
        const yaml = YAML.loadFront(fileContents);
        const filename = outputPath.substring(outputPath.lastIndexOf('/'), outputPath.lastIndexOf('.'));
        const title = yaml.title || unslugify(filename);
        outputPath = outputPath.replace(filename, `"${title}"`);
        console.log(filename, outputPath);
        exec(`./dist/markdown-to-standalone-html.js -K -C -CC -B -hs atom-one-dark-reasonable -d 0 -o ${outputPath} ${inputPath}`, function (err, stdout, stderr) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(stdout);
        });
    });
}
const docsPath = path.join(__dirname, 'docs');
const distPath = path.join(__dirname, 'dist');
exec("rm -rf dist/*");
const files = getFiles(docsPath);
convertFiles(files, 'docs', 'dist');
//# sourceMappingURL=convert-files.js.map
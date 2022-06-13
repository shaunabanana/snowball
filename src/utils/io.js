import { join } from 'path';
import { readFile, writeFile, mkdirSync } from 'fs';
import { stringify, parse } from 'yaml';
import sanitize from 'sanitize-basename';

const FORMAT = '.yaml';

export function writeIndex(projectData) {
    const indexPath = join(projectData.projectPath, `index${FORMAT}`);
    const indexData = {
        sheets: Object.keys(projectData.sheets).map((key) => ({
            id: key,
            name: projectData.sheets[key].name,
        })),
        papers: Object.keys(projectData.papers),
        tags: [...projectData.tags],
    };
    writeFile(indexPath, stringify(indexData), {
        encoding: 'utf8',
    });
}

export function writeSheet(projectData, sheetId) {
    const sheetPath = join(projectData.projectPath, 'sheets', sanitize(sheetId) + FORMAT);
    writeFile(sheetPath, stringify(projectData.sheets[sheetId]), {
        encoding: 'utf8',
    });
}

export function writePaper(projectData, paperId) {
    const paperPath = join(projectData.projectPath, 'papers', sanitize(paperId) + FORMAT);
    writeFile(paperPath, stringify(projectData.papers[paperId]), {
        encoding: 'utf8',
    });
}

export function writeProject(projectData) {
    console.log(projectData);
    mkdirSync(projectData.projectPath);

    writeIndex(projectData);

    const sheetsPath = join(projectData.projectPath, 'sheets');
    mkdirSync(sheetsPath);
    Object.keys(projectData.sheets).forEach((key) => {
        writeSheet(projectData, key);
    });

    const papersPath = join(projectData.projectPath, 'papers');
    mkdirSync(papersPath);
    Object.keys(projectData.papers).forEach((key) => {
        writePaper(projectData, key);
    });
}

export function readIndex(path) {
    return new Promise((resolve, reject) => {
        const indexPath = join(path, `index${FORMAT}`);
        readFile(indexPath, { encoding: 'utf8' }).then((indexContent) => {
            try {
                const indexData = parse(indexContent);
                resolve(indexData);
            } catch (error) {
                reject(error);
            }
        });
    });
}

export function readSheet(path, sheetId) {
    return new Promise((resolve, reject) => {
        const sheetPath = join(path, 'sheets', sanitize(sheetId) + FORMAT);
        readFile(sheetPath, { encoding: 'utf8' }).then((sheetContent) => {
            try {
                const sheetData = parse(sheetContent);
                resolve(sheetData);
            } catch (error) {
                reject(error);
            }
        });
    });
}

export function readPaper(path, paperId) {
    return new Promise((resolve, reject) => {
        const paperPath = join(path, 'papers', sanitize(paperId) + FORMAT);
        readFile('read_file', { path: paperPath }).then((paperContent) => {
            try {
                const paperData = parse(paperContent);
                resolve(paperData);
            } catch (error) {
                reject(error);
            }
        });
    });
}

export function readProject(path) {
    return new Promise((resolve) => {
        const projectData = {
            projectPath: path,
            sheets: {},
            papers: {},
            tags: [],
        };
        // Read index
        readIndex(path).then((indexData) => {
            console.log(indexData);
            projectData.tags = indexData.tags;

            // Read sheets
            Promise.all(
                indexData.sheets.map((sheetInfo) => readSheet(path, sheetInfo.id)),
            ).then((sheetsData) => {
                console.log(sheetsData);
                sheetsData.forEach((sheet) => {
                    projectData.sheets[sheet.id] = sheet;
                });

                // Read papers
                Promise.all(
                    indexData.papers.map((paperId) => readPaper(path, paperId)),
                ).then((papersData) => {
                    console.log(papersData);
                    papersData.forEach((paper) => {
                        projectData.papers[paper.id] = paper;
                    });

                    // Finally resolve the promise
                    resolve(projectData);
                });
            }).catch((errors) => {
                console.log('Error when reading sheets', errors);
            });
        });
    });
}

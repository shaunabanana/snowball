/* eslint-disable import/no-extraneous-dependencies */
import { join } from 'path';
import { mkdirSync, rmdirSync, existsSync } from 'fs';
import { readFile, writeFile, unlink } from 'fs/promises';
import { stringify, parse } from 'yaml';
import sanitize from 'sanitize-basename';
import sequmise from 'sequmise';

const FORMAT = '.yaml';

export async function writeIndex(projectData) {
    const indexPath = join(projectData.projectPath, `index${FORMAT}`);
    const indexData = {
        version: projectData.version,
        sheets: Object.keys(projectData.sheets).map((key) => ({
            id: key,
            name: projectData.sheets[key].name,
        })),
        papers: Object.keys(projectData.papers),
        tags: { ...projectData.tags },
    };
    await writeFile(indexPath, stringify(indexData), {
        encoding: 'utf8',
    });
}

export async function writeSheet(projectData, sheetId) {
    const sheetPath = join(projectData.projectPath, 'sheets', sanitize(sheetId) + FORMAT);
    await writeFile(sheetPath, stringify(projectData.sheets[sheetId]), {
        encoding: 'utf8',
    });
}

export async function writePaper(projectData, paperId) {
    const paperPath = join(projectData.projectPath, 'papers', sanitize(paperId) + FORMAT);
    await writeFile(paperPath, stringify(projectData.papers[paperId]), {
        encoding: 'utf8',
    });
}

export async function deleteSheet(projectData, sheetId) {
    const sheetPath = join(projectData.projectPath, 'sheets', sanitize(sheetId) + FORMAT);
    await unlink(sheetPath, { encoding: 'utf8' });
}

export async function deletePaper(projectData, paperId) {
    const paperPath = join(projectData.projectPath, 'papers', sanitize(paperId) + FORMAT);
    await unlink(paperPath, { encoding: 'utf8' });
}

export async function writeProject(projectData, scrap) {
    const sheetsPath = join(projectData.projectPath, 'sheets');
    const papersPath = join(projectData.projectPath, 'papers');

    if (scrap) {
        if (existsSync(projectData.projectPath)) {
            rmdirSync(projectData.projectPath, { recursive: true });
        }
        mkdirSync(projectData.projectPath);
        mkdirSync(sheetsPath);
        mkdirSync(papersPath);
    }

    await writeIndex(projectData);

    await sequmise(Object.keys(projectData.sheets).map((key) => async () => {
        await writeSheet(projectData, key);
    }));

    await sequmise(Object.keys(projectData.papers).map((key) => async () => {
        await writePaper(projectData, key);
    }));
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
        readFile(paperPath, { encoding: 'utf8' }).then((paperContent) => {
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
            version: undefined,
            projectPath: path,
            sheets: {},
            papers: {},
            tags: [],
        };
        // Read index
        readIndex(path).then((indexData) => {
            projectData.version = indexData.version;
            projectData.tags = indexData.tags;

            // Read sheets
            Promise.all(indexData.sheets.map((sheetInfo) => readSheet(path, sheetInfo.id)))
                .then((sheetsData) => {
                    sheetsData.forEach((sheet) => {
                        projectData.sheets[sheet.id] = sheet;
                    });

                    // Read papers
                    Promise.all(indexData.papers.map((paperId) => readPaper(path, paperId))).then(
                        (papersData) => {
                            papersData.forEach((paper) => {
                                projectData.papers[paper.id] = paper;
                            });

                            // Finally resolve the promise
                            resolve(projectData);
                        },
                    );
                })
                .catch((errors) => {
                    console.log('[IO][readProject] Error when reading sheets', errors);
                });
        });
    });
}

// import Worker from "worker-loader!./worker.js";
import { invoke } from '@tauri-apps/api/tauri';
import { join } from '@tauri-apps/api/path';
import { stringify, parse } from 'yaml';
import sanitize from 'sanitize-basename';
// import { resolve } from 'core-js/fn/promise';
// import { exists } from 'tauri-plugin-fs-extra-api'

// const worker = new Worker();

const FORMAT = '.yaml';

export function writeProject(projectData) {
    // worker.postMessage({
    //     command: 'write',
    //     path: path,
    //     contents: JSON.stringify(data)
    // })
    console.log(projectData)
    invoke('init_dir', {path: projectData.projectPath})

    writeIndex(projectData);

    join(projectData.projectPath, 'sheets').then(sheetsPath => {
        invoke('init_dir', {path: sheetsPath}).then(() => {
            Object.keys(projectData.sheets).forEach(key => {
                writeSheet(projectData, key);
            });
        })
    })

    join(projectData.projectPath, 'papers').then(papersPath => {
        invoke('init_dir', {path: papersPath}).then(() => {
            Object.keys(projectData.papers).forEach(key => {
                writePaper(projectData, key);
            });
        })
    })
}

export function writeIndex(projectData) {
    join(projectData.projectPath, 'index' + FORMAT).then(indexPath => {
        const indexData = {
            sheets: Object.keys(projectData.sheets).map(key => ({
                id: key,
                name: projectData.sheets[key].name
            })),
            papers: Object.keys(projectData.papers),
            tags: [...projectData.tags],
        }
        invoke('write_file', {
            path: indexPath,
            contents: stringify(indexData)
        })
    })
}

export function writeSheet(projectData, sheetId) {
    join(projectData.projectPath, 'sheets', sanitize(sheetId) + FORMAT).then(sheetPath => {
        invoke('write_file', {
            path: sheetPath,
            contents: stringify(projectData.sheets[sheetId])
        });
    })
}

export function writePaper(projectData, paperId) {
    join(projectData.projectPath, 'papers', sanitize(paperId) + FORMAT).then(paperPath => {
        invoke('write_file', {
            path: paperPath,
            contents: stringify(projectData.papers[paperId])
        });
    })
}

export function readProject(path) {
    return new Promise( resolve => {
        const projectData = {
            projectPath: path,
            sheets: {},
            papers: {},
            tags: []
        };
        // Read index
        readIndex(path).then(indexData => {
            console.log(indexData);
            projectData.tags = indexData.tags;

            // Read sheets
            Promise.all(
                indexData.sheets.map(sheetInfo => readSheet(path, sheetInfo.id))
            ).then(sheetsData => {
                console.log(sheetsData);
                sheetsData.forEach(sheet => {
                    projectData.sheets[sheet.id] = sheet;
                })

                // Read papers
                Promise.all(
                    indexData.papers.map(paperId => readPaper(path, paperId))
                ).then(papersData => {
                    console.log(papersData);
                    papersData.forEach(paper => {
                        projectData.papers[paper.id] = paper;
                    })

                    // Finally resolve the promise
                    resolve(projectData)
                })
            })
        });
    })
}


export function readIndex(path) {
    return new Promise( (resolve, reject) => {
        join(path, 'index' + FORMAT).then(indexPath => {
            invoke('read_file', {path: indexPath}).then(indexContent => {
                try {
                    const indexData = parse(indexContent);
                    resolve(indexData)
                } catch (error) {
                    reject(error);
                }
                
            })
        })
    });
}

export function readSheet(path, sheetId) {
    return new Promise( (resolve, reject) => {
        join(path, 'sheets', sanitize(sheetId) + FORMAT).then(sheetPath => {
            invoke('read_file', {path: sheetPath}).then(sheetContent => {
                try {
                    const sheetData = parse(sheetContent);
                    resolve(sheetData)
                } catch (error) {
                    reject(error);
                }
            })
        })
    });
}

export function readPaper(path, paperId) {
    return new Promise( (resolve, reject) => {
        join(path, 'papers', sanitize(paperId) + FORMAT).then(paperPath => {
            invoke('read_file', {path: paperPath}).then(paperContent => {
                try {
                    const paperData = parse(paperContent);
                    resolve(paperData)
                } catch (error) {
                    reject(error);
                }
            })
        })
    });
}
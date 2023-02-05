import { stringify, parse } from 'yaml';
import { join } from 'path';
import {
    existsSync,
    rmdirSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    // unlink,
} from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
    // app,
    ipcMain,
    // BrowserWindow,
    // dialog,
    // shell,
} from 'electron';

const persistedNodeProps = [
    'id',
    'type',
    'position',
];

const persistedEdgeProps = [
    'id',
    'type',
    'source',
    'target',
    'sourceHandle',
    'targetHandle',
];

function writeWorkflowData(store) {
    const dataPath = join(store.projectPath, 'data');
    const workflowPath = join(store.projectPath, 'workflow');

    store.workflow.forEach((element) => {
        if (element.type === 'default') return;

        const nodePath = join(workflowPath, `${element.id}.yaml`);
        writeFileSync(nodePath, stringify(element.data || {}), {
            encoding: 'utf8',
        });

        const nodeDataPath = join(dataPath, element.id);
        if (existsSync(nodeDataPath)) {
            rmdirSync(nodeDataPath, { recursive: true });
        }
        mkdirSync(nodeDataPath);

        writeFileSync(
            join(nodeDataPath, 'input.yaml'),
            stringify(store.dataflow.input[element.id] || {}),
            { encoding: 'utf8' },
        );

        writeFileSync(
            join(nodeDataPath, 'output.yaml'),
            stringify(store.dataflow.output[element.id] || {}),
            { encoding: 'utf8' },
        );
    });
}

function writeIndex(store) {
    const indexPath = join(store.projectPath, 'index.yaml');
    const indexData = {
        version: store.version,
        tags: [...store.tags],
        notes: store.notes,
        workflow: store.workflow.map((element) => {
            const stripped = {};
            // Strip element of its data, leaving only the workflow metadata
            if (element.type === 'default') {
                // This is an edge
                persistedEdgeProps.forEach((prop) => {
                    stripped[prop] = element[prop];
                });
            } else {
                // This is a node
                persistedNodeProps.forEach((prop) => {
                    stripped[prop] = element[prop];
                });
            }
            return stripped;
        }),
    };
    writeFileSync(indexPath, stringify(indexData), {
        encoding: 'utf8',
    });
}

function writeProject(store) {
    writeIndex(store);
    writeWorkflowData(store);
}

function createProject(projectPath) {
    const dataPath = join(projectPath, 'data');
    const workflowPath = join(projectPath, 'workflow');

    if (existsSync(projectPath)) {
        rmdirSync(projectPath, { recursive: true });
    }
    mkdirSync(projectPath);
    mkdirSync(dataPath);
    mkdirSync(workflowPath);
}

function readProject(projectPath) {
    // const dataPath = join(projectPath, 'data');
    const workflowPath = join(projectPath, 'workflow');
    const indexPath = join(projectPath, 'index.yaml');

    const indexFileContent = readFileSync(indexPath, { encoding: 'utf8' });
    const projectData = parse(indexFileContent);
    projectData.dataflow = { input: {}, output: {} };
    projectData.workflow.forEach((element) => {
        if (element.type === 'default') return;

        const nodePath = join(workflowPath, `${element.id}.yaml`);
        const dataFileContent = readFileSync(nodePath, { encoding: 'utf8' });
        // eslint-disable-next-line no-param-reassign
        element.data = parse(dataFileContent);

        // const nodeInputPath = join(dataPath, `${element.id}/input.yaml`);
        // const nodeOutputPath = join(dataPath, `${element.id}/output.yaml`);

        // const inputFileContent = readFileSync(nodeInputPath, { encoding: 'utf8' });
        // projectData.dataflow.input[element.id] = parse(inputFileContent);

        // const outputFileContent = readFileSync(nodeOutputPath, { encoding: 'utf8' });
        // projectData.dataflow.output[element.id] = parse(outputFileContent);
    });
    return projectData;
}

ipcMain.handle('create-project', (event, projectPath) => {
    createProject(projectPath);
});

ipcMain.handle('write-project', (event, data) => {
    writeProject(JSON.parse(data));
});

ipcMain.handle('read-project', (event, projectPath) => readProject(projectPath));

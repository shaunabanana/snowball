import git from 'isomorphic-git';
import { writeProject } from '@/utils/io';
import { join } from 'path';
import sanitize from 'sanitize-basename';
import AwaitLock from 'await-lock';

const globby = require('globby');

const fs = require('fs');

async function commitFiles(lock, state, options) {
    await lock.acquireAsync();
    try {
        const paths = await globby(['**', '**/.*'], {
            gitignore: true,
            cwd: state.projectPath,
        });
        paths.forEach(async (filePath) => {
            await git.add({
                fs, dir: state.projectPath, filepath: filePath,
            });
        });
        await git.commit({
            fs,
            dir: state.projectPath,
            ...options,
        });
    } finally {
        lock.release();
    }
}

// async function changedFiles(lock, state) {
//     const files = await git.listFiles({ fs, dir: state.projectPath });
//     const statuses = await git.statusMatrix({
//         fs,
//         dir: state.projectPath,
//         filepaths: files,
//     });
//     return statuses.filter((stat) => !(stat[1] === 1 && stat[2] === 1 && stat[3] === 1))
//         .map((row) => row[0]);
// }

async function commitFile(lock, state, file, options) {
    async function commitAfterChange() {
        await lock.acquireAsync();
        try {
            const files = Array.isArray(file) ? file : [file];
            files.some(async (filePath) => {
                const status = await git.status({
                    fs, dir: state.projectPath, filepath: filePath,
                });
                if (status === 'unmodified') {
                    console.log('File is unmodified, trying again in 100ms');
                    setTimeout(commitAfterChange, 100);
                    return true;
                }
                return false;
            });
            console.log('Commiting');
            await git.add({
                fs, dir: state.projectPath, filepath: file,
            });
            await git.commit({
                fs,
                dir: state.projectPath,
                ...options,
            });
        } finally {
            lock.release();
        }
    }
    commitAfterChange();
}

async function gatherHistory(lock, state) {
    await lock.acquireAsync();
    try {
        const commits = await git.log({
            fs,
            dir: state.projectPath,
        });
        console.log(commits);
    } finally {
        lock.release();
    }
}

async function handlePaperUpdate(lock, state, mutation) {
    // Choose verb based on mutation type.
    let heading;
    if (mutation.payload.updates.decision) {
        heading = {
            include: 'Include',
            exclude: 'Exclude',
            undecided: 'Un-decide',
        }[mutation.payload.updates.decision];
    } else if (mutation.payload.updates.tags) {
        heading = 'Tag';
    } else if (mutation.payload.updates.comments) {
        heading = 'Comment on';
    } else {
        heading = 'Update';
    }

    // Choose method to describe paper based on number on papers involved.
    let title;
    if (Array.isArray(mutation.payload.paper)) {
        title = `${mutation.payload.paper.length} papers`;
    } else {
        const paper = state.papers[mutation.payload.paper];
        title = paper.title.slice(0, 40) + (paper.title.length > 40 ? '...\n' : '\n');
        title = `"${title}"`;
    }

    let file;
    if (Array.isArray(mutation.payload.paper)) {
        file = mutation.payload.paper.map((paperId) => join('papers', `${sanitize(paperId)}.yaml`));
    } else {
        file = join('papers', `${sanitize(mutation.payload.paper)}.yaml`);
    }
    await commitFile(lock, state, file, {
        author: state.user,
        message: `${heading} ${title}`,
    });
}

export default function historyTracking(store) {
    const ignoreEvents = ['setLoading'];
    const lock = new AwaitLock();
    // called when the store is initialized
    store.subscribe(async (mutation, state) => {
        if (ignoreEvents.includes(mutation.type)) return;

        if (mutation.type === 'setProjectPath') {
            if (mutation.payload.shouldInit) {
                console.log('[setProjectPath] shouldInit is set to true.');
                writeProject(state, true);
                console.log(state.projectPath);
                await git.init({ fs, dir: state.projectPath, defaultBranch: 'main' });
                console.log('[setProjectPath] Initialized empty git repository.');
                await commitFiles(lock, state, {
                    author: {
                        name: 'Snowball',
                    },
                    message: 'Create empty project.',
                });
            }
            await gatherHistory(lock, state);
        } else if (mutation.type === 'addPapers') {
            await commitFiles(lock, state, {
                author: state.user,
                message: 'Add papers',
            });
        } else if (mutation.type === 'addSheet') {
            await commitFiles(lock, state, {
                author: state.user,
                message: 'Add new sheet',
            });
        } else if (mutation.type === 'updatePaper') {
            await handlePaperUpdate(lock, state, mutation);
        } else if (
            mutation.type === 'addTag'
            || mutation.type === 'deleteTag'
            || mutation.type === 'updateTag'
        ) {
            console.log(`[${mutation.type}]`, JSON.stringify(mutation.payload));
        }
    });
}

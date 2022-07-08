import git from 'isomorphic-git';
import { writeProject, readProject } from '@/utils/io';
import { join } from 'path';
import sanitize from 'sanitize-basename';
import AwaitLock from 'await-lock';

const globby = require('globby');

const fs = require('fs');

// async function changedFiles(lock, state) {
//     await lock.acquireAsync();
//     try {
//         const files = await git.listFiles({ fs, dir: state.projectPath });
//         const statuses = await git.statusMatrix({
//             fs,
//             dir: state.projectPath,
//             filepaths: files,
//         });
//         return statuses.filter((stat) => !(stat[1] === 1 && stat[2] === 1 && stat[3] === 1))
//             .map((row) => row[0]);
//     } finally {
//         lock.release();
//     }
// }

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
                    console.log('[History][commitFile] File is unmodified, trying again in 100ms');
                    setTimeout(commitAfterChange, 100);
                    return true;
                }
                return false;
            });
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

async function switchToUserBranch(lock, state) {
    await lock.acquireAsync();
    try {
        const branchName = state.user.name.replace(' ', '-').toLowerCase();
        const branches = await git.listBranches({ fs, dir: state.projectPath });
        if (!branches.includes(branchName)) {
            console.log(`[History][switchToUserBranch] Branch "${branchName}" does not exist. Creating it from main.`);
            await git.checkout({
                fs, dir: state.projectPath, ref: 'main', force: true,
            });
            await git.branch({ fs, dir: state.projectPath, ref: branchName });
        }
        console.log(`[History][switchToUserBranch] Switching to branch "${branchName}"`);
        await git.checkout({ fs, dir: state.projectPath, ref: branchName });
    } finally {
        lock.release();
    }
}

export default function historyTracking(store) {
    const ignoreEvents = ['setLoading'];
    const lock = new AwaitLock();
    // called when the store is initialized
    store.subscribe(async (mutation, state) => {
        if (ignoreEvents.includes(mutation.type)) return;

        if (mutation.type === 'setProjectPath') {
            if (mutation.payload.shouldInit) {
                console.log('[History][setProjectPath] shouldInit is set to true.');
                writeProject(state, true);
                await git.init({ fs, dir: state.projectPath, defaultBranch: 'main' });
                console.log('[History][setProjectPath] Initialized empty git repository.');
                await commitFiles(lock, state, {
                    author: {
                        name: 'Snowball',
                    },
                    message: 'Create empty project.',
                });
            }
            await gatherHistory(lock, state);
        } else if (mutation.type === 'setUser') {
            const branches = await git.listBranches({ fs, dir: state.projectPath });
            // If there is more than one branch, this project already has some progress.
            if (branches.length > 1) {
                store.commit('setLoading', true);
                await switchToUserBranch(lock, state);
                // reload project here
                readProject(state.projectPath).then((projectData) => {
                    store.commit('loadProject', projectData);
                    store.commit('setLoading', false);
                });
            }
        } else if (mutation.type === 'addPapers') {
            await commitFiles(lock, state, {
                author: state.user,
                message: 'Add papers',
            });
            const branches = await git.listBranches({ fs, dir: state.projectPath });
            // If there is only a main branch, this project just started.
            if (branches.length === 1) {
                console.log('[History][addPapers] Papers added to main branch. Now creating & switching to user branch.');
                await switchToUserBranch(lock, state);
            }
            store.commit('setLoading', false);
        } else if (mutation.type === 'addSheet') {
            if (!mutation.payload.preventCommit) {
                await commitFiles(lock, state, {
                    author: state.user,
                    message: `Add new sheet "${mutation.payload.name}"`,
                });
            }
        } else if (mutation.type === 'updatePaper') {
            if (!mutation.payload.preventCommit) {
                await handlePaperUpdate(lock, state, mutation);
            }
        } else if (mutation.type === 'addTag') {
            await commitFile(lock, state, 'index.yaml', {
                author: state.user,
                message: `Define new tag "${mutation.payload.id}"`,
            });
        } else if (mutation.type === 'deleteTag') {
            await commitFiles(lock, state, {
                author: state.user,
                message: `Delete tag "${mutation.payload.id}"`,
            });
        } else if (mutation.type === 'updateTag') {
            await commitFile(lock, state, 'index.yaml', {
                author: state.user,
                message: `Update tag "${mutation.payload.tag}"`,
            });
        }
    });
}

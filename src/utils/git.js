import git from 'isomorphic-git';
import { readProject } from '@/utils/io';
import sequmise from 'sequmise';
// import AwaitLock from 'await-lock';
const fs = require('fs');

export async function gatherRepository(state) {
    const result = {
        branches: [],
        authors: {},
    };

    const branches = await git.listBranches({ fs, dir: state.projectPath });
    const originalBranch = await git.currentBranch({ fs, dir: state.projectPath });
    await sequmise(branches.map((branchName) => async () => {
        if (branchName === 'main') return;
        console.log(`[Compare][switchToBranch] Switching to branch "${branchName}"`);
        await git.checkout({
            fs, dir: state.projectPath, ref: branchName, force: true,
        });
        console.log('[Compare][switchToBranch] Reading project directory...');
        const projectData = await readProject(state.projectPath);
        const commits = await git.log({ fs, dir: state.projectPath });

        commits.forEach((record) => {
            // The "Snowball" author does not have an email.
            if (record.commit.author && record.commit.author.email) {
                result.authors[record.commit.author.name] = record.commit.author;
            }
        });
        result.branches.push({
            name: branchName,
            data: projectData,
            commits,
        });
    }));

    result.authors = Object.keys(result.authors).map(
        (name) => result.authors[name],
    );

    console.log(`[Compare][switchToBranch] Switching back to original branch "${originalBranch}"`);
    await git.checkout({
        fs, dir: state.projectPath, ref: originalBranch, force: true,
    });

    return result;
}

function mergeBranches(repo) {
    const merged = {
        papers: {},
        tags: {},
    };

    const branchToName = {};
    repo.authors.forEach((author) => {
        const branchName = author.name.replace(' ', '-').toLowerCase();
        branchToName[branchName] = author.name;
    });

    repo.branches.forEach((branch) => {
        // Merge tags
        Object.keys(branch.data.tags).forEach((tagId) => {
            const tag = { ...branch.data.tags[tagId] };
            tag.id = `${branch.name}-${tag.id}`;
            tag.author = branchToName[branch.name];
            merged.tags[tag.id] = tag;
        });

        // Merge papers
        Object.keys(branch.data.papers).forEach((paperId) => {
            const paper = { ...branch.data.papers[paperId] };
            paper.tags = paper.tags.map((tagId) => `${branch.name}-${tagId}`);
            paper.conflicts = {
                decision: [
                    { branch: branch.name, value: paper.decision },
                ],
                abstract: [
                    { branch: branch.name, value: paper.abstract },
                ],
                doi: [
                    { branch: branch.name, value: paper.doi },
                ],
            };
            if (merged.papers[paper.id]) {
                // Tags & comments can be simply merged.
                const mergedTags = merged.papers[paper.id].tags.concat(paper.tags);
                const mergedComments = merged.papers[paper.id].tags.concat(paper.comments);
                merged.papers[paper.id].tags = mergedTags;
                merged.papers[paper.id].comments = mergedComments;

                // Decisions might conflict. Abstracts & DOIs might be edited.
                ['decision', 'abstract', 'doi'].forEach((field) => {
                    if (merged.papers[paper.id][field] !== paper[field]) {
                        merged.papers[paper.id].conflicts[field].push({
                            branch: branch.name, value: paper[field],
                        });
                    }
                });
            } else {
                merged.papers[paper.id] = paper;
            }
        });
    });
    return merged;
}

export async function compareBranches(state) {
    const repo = await gatherRepository(state);
    console.log(repo);
    const merged = mergeBranches(repo);
    return merged;
}

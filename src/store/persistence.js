// import moment from 'moment';
import {
    writeProject, writePaper, writeSheet, writeIndex, deleteSheet, deletePaper,
} from '@/utils/io';
import lock from '@/store/lock';

export default function filePersistence(store) {
    const ignoreEvents = ['setLoading', 'loadProject'];
    // called when the store is initialized
    store.subscribe(async (mutation, state) => {
        await lock.acquireAsync();
        console.log('[Persist][Lock] Acquired lock.');
        try {
            if (ignoreEvents.includes(mutation.type)) return;
            if (mutation.type === 'setProjectPath') {
                if (mutation.payload.shouldInit) {
                    console.log('[Persist][setProjectPath] shouldInit is set to true.');
                    writeProject(state, true);
                }
            } else if (mutation.type === 'addPapers') {
                console.log('[Persist][addPapers] Saving state to', state.projectPath);
                await writeProject(state);
                store.commit('setLoading', false);
            } else if (mutation.type === 'updatePaper') {
                console.log('[Persist][updatePaper]', JSON.stringify(mutation.payload));
                let papers = mutation.payload.paper;
                if (!Array.isArray(mutation.payload.paper)) papers = [mutation.payload.paper];
                papers.forEach((paper) => writePaper(state, paper));
            } else if (mutation.type === 'deletePaper') {
                console.log('[Persist][deletePaper]', JSON.stringify(mutation.payload));
                await deletePaper(state, mutation.payload);
            } else if (
                mutation.type === 'addTag'
                || mutation.type === 'deleteTag'
            ) {
                console.log(`[Persist][${mutation.type}]`, JSON.stringify(mutation.payload));
                await writeIndex(state);
            } else if (mutation.type === 'updateTag') {
                console.log(`[Persist][updateTag] ${JSON.stringify(mutation.payload)}`);
                await writeProject(state);
            } else if (mutation.type === 'addSheet') {
                console.log('[Persist][addSheet]', mutation.payload.id);
                await writeIndex(state);
                await writeSheet(state, mutation.payload.id);
            } else if (mutation.type === 'updateSheet') {
                console.log('[Persist][updateSheet]', JSON.stringify(mutation.payload));
                let sheets = mutation.payload.sheet;
                if (!Array.isArray(mutation.payload.sheet)) sheets = [mutation.payload.sheet];
                sheets.forEach((sheet) => writeSheet(state, sheet));
                await writeIndex(state);
            } else if (mutation.type === 'deleteSheet') {
                console.log('[Persist][deleteSheet]', JSON.stringify(mutation.payload));
                await deleteSheet(state, mutation.payload);
                await writeIndex(state);
            } else {
                console.log(`[Persist][${mutation.type}] ${JSON.stringify(mutation.payload)}`);
            }
        } finally {
            lock.release();
            console.log('[Persist][Lock] Released lock.');
        }
    });
}

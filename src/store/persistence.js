// import moment from 'moment';
import {
    writeProject, writePaper, writeSheet, writeIndex,
} from '@/utils/io';

export default function filePersistence(store) {
    const ignoreEvents = ['setLoading', 'setProjectPath', 'loadProject'];
    // called when the store is initialized
    store.subscribe((mutation, state) => {
        if (ignoreEvents.includes(mutation.type)) return;
        if (mutation.type === 'addPapers') {
            console.log('[Persist][addPapers] Saving state to', state.projectPath);
            writeProject(state);
        } else if (mutation.type === 'updatePaper') {
            console.log('[Persist][updatePaper]', JSON.stringify(mutation.payload));
            let papers = mutation.payload.paper;
            if (!Array.isArray(mutation.payload.paper)) papers = [mutation.payload.paper];
            papers.forEach((paper) => writePaper(state, paper));
        } else if (
            mutation.type === 'addTag'
            || mutation.type === 'deleteTag'
            || mutation.type === 'updateTag'
        ) {
            console.log(`[Persist][${mutation.type}]`, JSON.stringify(mutation.payload));
            writeIndex(state);
        } else if (mutation.type === 'addSheet') {
            console.log('[Persist][addSheet]', mutation.payload.id);
            writeIndex(state);
            writeSheet(state, mutation.payload.id);
        } else {
            console.log(`[Persist][${mutation.type}] ${JSON.stringify(mutation.payload)}`);
        }
    });
}

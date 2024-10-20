import AsyncLock from 'async-lock';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import debounce from '@/utils/debounce';

const lock = new AsyncLock({
    maxPending: 1,
});

const writeProject = debounce((store) => {
    if (!store.projectPath || store.projectPath.length === 0) return;
    lock.acquire('writeProject', () => new Promise((resolve, reject) => {
        console.log('Writing the project', store);
        ipcRenderer.invoke('write-project', JSON.stringify({
            version: store.version,
            projectPath: store.projectPath,
            workflow: store.workflow,
            dataflow: store.dataflow,
            notes: store.notes,
            tags: store.tags,
            user: store.user
        }))
        .then(() => resolve())
        .catch((error) => reject(error));
    })).then(() => {
        console.log('Successfully written project');
    }).catch((error) => {
        if (error.message !== 'Too many pending tasks in queue writeProject') {
            throw error;
        }
    });
}, 1500);
export default writeProject;

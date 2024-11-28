import AsyncLock from 'async-lock';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import omit from 'just-omit';
import clone from 'just-clone';
import debounce from '@/utils/debounce';

const lock = new AsyncLock({
    maxPending: 1,
});


function getDataToSave(store) {
    const data = {
        version: store.version,
        projectPath: store.projectPath,
        workflow: store.workflow.map((item) => {
            if (item.type === "default") {
                // item is an edge, remove references to nodes
                return omit(item, "sourceNode", "targetNode")
            } else {
                // item is a node.
                // Remove the "run" function to make it serializable.
                return {
                    ...item,
                    data: omit(item.data, "run")
                }
            }
        }),
        // dataflow: store.dataflow,
        notes: store.notes,
        tags: store.tags,
        user: store.user
    };
    return clone(data);
}

const writeProject = debounce((store) => {
    if (!store.projectPath || store.projectPath.length === 0) return;
    lock.acquire('writeProject', () => new Promise((resolve, reject) => {
        console.log('Writing the project', store);
        ipcRenderer.invoke('write-project', getDataToSave(store))
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

import { readTextFile, writeFile } from '@tauri-apps/api/fs';


onmessage = function(event) {
    if (event.data.command === 'write') {
        writeFile(event.data);
    } else if (event.data.command === 'read') {
        console.log('Worker reading', event.data.path);
        readTextFile(event.data.path).then(content => {
            console.log('Worker reading done.');
            postMessage(content)
        })
    }
}
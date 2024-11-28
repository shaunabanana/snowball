/* eslint-disable no-restricted-globals */
self.onmessage = ({ data }) => {
    const input = JSON.parse(data);
    importScripts(input.code);
    const output = run(input.data);
    self.postMessage(output);
};
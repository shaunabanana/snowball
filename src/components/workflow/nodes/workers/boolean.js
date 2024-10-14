/* eslint-disable no-restricted-globals */
self.onmessage = ({ data }) => {
    const { selection1, selection2, operation } = JSON.parse(data);
    let result;

    const set1 = new Set(selection1);
    const set2 = new Set(selection2);

    if (operation === 'union') {
        result = new Set(selection1.concat(selection2))
    } else if (operation === 'difference') {
        result = selection1.filter((id) => !set2.has(id))
    } else if (operation === 'intersection') {
        result = selection1.filter((id) => set2.has(id));
    }

    self.postMessage({
        selection: Array.from(result)
    });
};

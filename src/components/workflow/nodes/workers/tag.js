/* eslint-disable no-restricted-globals */
self.onmessage = ({ data }) => {
    const {
        papers, selection, name,
    } = JSON.parse(data);

    let selectedPapers = papers;
    // If selection is specified, then filter input data using
    if (Array.isArray(selection) && selection.length > 0) {
        selectedPapers = selectedPapers.filter(
            (paper) => selection.includes(paper.id),
        );
    }

    selectedPapers.forEach((paper) => {
        if (!paper.tags.includes(name)) {
            paper.tags.push(name);
        }
    });

    self.postMessage({
        papers,
        tagged: selectedPapers.map((paper) => paper.id),
    });
};

/* eslint-disable no-restricted-globals */
self.onmessage = ({ data }) => {
    const { papers, edits, selection } = JSON.parse(data);
    let selectedPapers = papers;
    // If selection is specified, then filter input data using
    if (selection && selection.length > 0) {
        selectedPapers = selectedPapers.filter(
            (paper) => selection.includes(paper.id),
        );
    }

    selectedPapers.forEach((paper, index) => {
        if (edits[paper.id]) {
            Object.keys(edits[paper.id]).forEach((property) => {
                if (Array.isArray(edits[paper.id][property])) {
                    edits[paper.id][property].forEach((item) => {
                        if (selectedPapers[index][property].includes(item)) return;
                        selectedPapers[index][property].push(item);
                    });
                } else {
                    selectedPapers[index][property] = edits[paper.id][property];
                }
            });
        }
    });

    const result = {
        papers: selectedPapers,
        output: {
            papers,
            sheet: selectedPapers.map((p) => p.id),
            included: selectedPapers.filter((paper) => paper.decision === 'include').map((p) => p.id),
            excluded: selectedPapers.filter((paper) => paper.decision === 'exclude').map((p) => p.id),
            undecided: selectedPapers.filter((paper) => paper.decision === 'undecided').map((p) => p.id),
        },
    };

    self.postMessage(result);
};

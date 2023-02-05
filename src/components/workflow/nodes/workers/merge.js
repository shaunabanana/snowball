import stringSimilarity from 'string-similarity';
import dbscan from '@cdxoo/dbscan';

function calculateDistance(paper1, paper2) {
    let similarity = 1;
    if (paper1.id && paper1.id === paper2.id) return 0;
    if (paper1.doi && paper1.doi === paper2.doi) return 0;

    const titleSimilarity = stringSimilarity.compareTwoStrings(
        paper1.title.toLowerCase(),
        paper2.title.toLowerCase(),
    );
    similarity *= titleSimilarity;

    // console.log(`${paper1.title}, ${paper2.title}`, 1 - similarity);

    return 1 - similarity;
}

function mergePapers(paper1, paper2) {
    Object.keys(paper2).forEach((key) => {
        // eslint-disable-next-line no-param-reassign
        if (!paper1[key]) paper1[key] = paper2[key];
        if (Array.isArray(paper1[key]) && Array.isArray(paper2[key])) {
            // eslint-disable-next-line no-param-reassign
            paper1[key] = [...new Set(paper1[key].concat(paper2[key]))];
        }
    });
    // eslint-disable-next-line no-param-reassign
    if (paper1.doi) paper1.id = paper1.doi;
    return paper1;
}

function handleInput({
    input, threshold, merges, paperHandles,
}) {
    const inputArray = Object.keys(input).map((key) => input[key]);
    const inputPapers = inputArray[0].concat(...inputArray.slice(1));

    const result = dbscan({
        dataset: inputPapers,
        epsilon: threshold,
        distanceFunction: calculateDistance,
    });
    console.log(result);

    // Duplicates are the clusters whose length > 1
    const duplicates = result.clusters
        .filter((dataIds) => dataIds.length > 1)
        .map((dataIds) => ({ merged: false, papers: dataIds.map((id) => inputPapers[id]) }));

    // For the other clusters with only 1 element, combine them with the noise
    const singleClusters = result.clusters.filter((dataIds) => dataIds.length < 2);
    console.log(singleClusters);
    const singlePapers = singleClusters.length > 0
        ? singleClusters[0].concat(...singleClusters.slice(1))
        : [];
    const all = result.noise.concat(singlePapers).map((id) => inputPapers[id]);

    // Start merging
    let mergedCount = 0;
    duplicates.forEach((group) => {
        const groupMerges = merges[group.papers[0].id];
        const others = group.papers.slice(1).map((p) => p.id);
        // console.log(paperIds, merges);
        const shouldMerge = groupMerges
            ? others.filter((pid) => !groupMerges.includes(pid)).length === 0
            : false;

        if (shouldMerge) {
            console.log('merging group', group);
            let merged = group.papers[0];
            group.papers.slice(1).forEach((paper) => {
                merged = mergePapers(merged, paper);
            });
            all.push(merged);
            // eslint-disable-next-line no-param-reassign
            group.merged = true;
            mergedCount += 1;
        } else {
            group.papers.forEach((paper) => all.push(paper));
        }
    });

    const output = {
        papers: all,
    };
    // Separate the merged result into different ports according to original input data
    paperHandles.forEach((handle, index) => {
        const port = `port${index}`;
        const inputIds = input[port].map((p) => p.id);
        const portOutput = [];
        all.forEach((paper) => {
            if (inputIds.includes(paper.id)) portOutput.push(paper);
        });
        output[port] = portOutput;
    });
    return {
        duplicates,
        mergedCount,
        output,
        total: inputPapers.length,
    };
}

function handleMerge(payload) {
    return payload;
}

/* eslint-disable no-restricted-globals */
self.onmessage = ({ data: { command, payload } }) => {
    const payloadObject = JSON.parse(payload);
    if (command === 'handleInput') {
        self.postMessage(handleInput(payloadObject));
    } else if (command === 'handleMerge') {
        self.postMessage(handleMerge(payloadObject));
    }
};

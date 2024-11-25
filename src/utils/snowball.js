import ky from 'ky';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';

import pThrottle from 'p-throttle';

import { formatCitationJsRecord, formatPapers } from './common';


const throttle = pThrottle({
	limit: 1,
	interval: 1000
});


function splitChunks(array, chunkSize) {
    return array.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);

        if (!resultArray[chunkIndex]) {
            // eslint-disable-next-line no-param-reassign
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);
}


const getCitationJsRecord = throttle(async (doi) => {
    const response = await Cite(doi);
    if (response.data.length === 0) return null;
    return response.data[0];
})


export async function querySemanticScholar(dois, getCitations, getReferences, includeArxiv, onProgress) {
    const query = "https://api.semanticscholar.org/graph/v1/paper/batch"
    const fields = ["title", "externalIds", "abstract", "year"]

    const citationFields = getCitations ? fields.map((field) => `citations.${field}`): []
    const referenceFields = getReferences ? fields.map((field) => `references.${field}`): []

    console.log(citationFields, referenceFields);

    // The API allows a maximum of 500 papers at once. See https://api.semanticscholar.org/api-docs/#tag/Paper-Data/operation/post_graph_get_papers
    const chunks = splitChunks(dois, 500);

    let newDOIs = new Set();
    const ssRecord = {};

    const papers = [];
    const graph = [];
    const citations = [];
    const references = [];

    for (let chunkIndex in chunks) {
        const chunk = chunks[chunkIndex];
        const results = await ky.post(query, {
            searchParams: {
                fields: citationFields.concat(referenceFields).join(",")
            },
            json: {
                ids: chunk.map((doi) => `DOI:${doi}`)
            }
        }).json()

        if (onProgress) onProgress({ step: "Fetching relations...", progress: chunkIndex, target: chunks.length})

        console.log(results);

        for (let index in results) {
            const doi = chunk[index];
            const result = results[index];
            if (!result) continue;
            console.log(`Parsing results for ${doi}...`);
            for (let property of ["citations", "references"]) {
                if (!result[property]) continue;
                for (let citation of result[property]) {
                    if (!citation.externalIds) continue;
                    if (!citation.externalIds.DOI) {
                        if (citation.externalIds.ArXiv && !includeArxiv) {
                            citation.externalIds.DOI = `10.48550/arxiv.${citation.externalIds.ArXiv}`;
                        } else {
                            continue;
                        }
                    }
                    if (!includeArxiv && citation.externalIds.DOI.toLowerCase().startsWith("10.48550/arxiv")) continue;
                    const newDOI = citation.externalIds.DOI.toLowerCase();
                    newDOIs.add(newDOI);
                    ssRecord[newDOI] = citation;
                    console.log(newDOI);

                    if (property === "citations") {
                        graph.push({source: newDOI, target: doi})
                        citations.push(newDOI);
                    } else if (property === "references") {
                        graph.push({source: doi, target: newDOI})
                        references.push(newDOI);
                    }
                }
            }
        }
    }
    newDOIs = [...newDOIs];
    console.log(newDOIs);
    console.log(`Retrieving metadata for new DOIs...`);
    for (let doiIndex in newDOIs) {
        const doi = newDOIs[doiIndex];
        if (onProgress) onProgress({ step: "Fetching metadata...", progress: doiIndex, target: newDOIs.length})
        try {
            console.log(`${doi}`);
            const record = await getCitationJsRecord(doi);
            const paper = formatCitationJsRecord(record, ssRecord[doi]);
            papers.push(paper);
        } catch (e) {
            console.log(e);
            continue
        }
    }

    return { papers: formatPapers(papers), graph, citations, references }
}

export function snowball(source, dois, user) {
    if (source === "semantic_scholar") {
        querySemanticScholar(dois)
    }
}
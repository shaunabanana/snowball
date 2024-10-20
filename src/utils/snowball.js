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


export async function querySemanticScholar(dois, getCitations, getReferences, includeArxiv) {
    const query = "https://api.semanticscholar.org/graph/v1/paper/batch"
    const fields = ["title", "externalIds", "abstract", "year"]

    const citationFields = getCitations ? fields.map((field) => `citations.${field}`): []
    const referenceFields = getReferences ? fields.map((field) => `references.${field}`): []

    console.log(citationFields, referenceFields);

    // The API allows a maximum of 500 papers at once. See https://api.semanticscholar.org/api-docs/#tag/Paper-Data/operation/post_graph_get_papers
    const chunks = splitChunks(dois, 500);

    const newDOIs = new Set();
    const papers = [];
    const graph = [];
    const citations = [];
    const references = [];

    for (let chunk of chunks) {
        const results = await ky.post(query, {
            searchParams: {
                fields: citationFields.concat(referenceFields).join(",")
            },
            json: {
                ids: chunk.map((doi) => `DOI:${doi}`)
            }
        }).json()

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
                    console.log(citation.externalIds.DOI);
                    try {
                        const record = await getCitationJsRecord(citation.externalIds.DOI);
                        const paper = formatCitationJsRecord(record, citation);
                        papers.push(paper);

                        if (property === "citations") {
                            graph.push({source: paper.id, target: doi})
                            citations.push(paper.id);
                        } else if (property === "references") {
                            graph.push({source: doi, target: paper.id})
                            references.push(paper.id);
                        }
                    } catch (e) {
                        console.log(e);
                        continue
                    }
                }
            }
        }
    }

    return { papers: formatPapers(papers), graph, citations, references }
}

export function snowball(source, dois, user) {
    if (source === "semantic_scholar") {
        querySemanticScholar(dois)
    }
}
import axios from 'axios';
import Queue from 'queue-promise';

function formatSemanticScholarPaper(paper) {
    let { paperId } = paper;
    if (paper.externalIds && paper.externalIds.DOI) {
        paperId = paper.externalIds.DOI;
    }
    return {
        id: paperId.toLowerCase(),
        doi: paper.externalIds ? paper.externalIds.DOI : undefined,
        type: 'paper',
        title: paper.title,
        authors: paper.authors.map((author) => ({ family: author.name, given: '' })),
        abstract: paper.abstract,
        year: paper.year ? paper.year : 'Unknown',
        keywords: [],
        record: { ...paper },
    };
}

export function querySemanticScholar(doi) {
    const citations = [];
    const references = [];

    return new Promise((resolve) => {
        axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/references?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((refResponse) => {
            console.log('[Literature][querySemanticScholar] Got response for references', refResponse.data.data);
            refResponse.data.data.forEach((paper) => {
                if (paper.citedPaper.paperId) {
                    references.push(formatSemanticScholarPaper(paper.citedPaper));
                }
            });

            axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((citeResponse) => {
                console.log('[Literature][querySemanticScholar] Got response for citations', citeResponse.data.data);
                citeResponse.data.data.forEach((paper) => {
                    if (paper.citingPaper.paperId) {
                        citations.push(formatSemanticScholarPaper(paper.citingPaper));
                    }
                });
                resolve({
                    citations,
                    references,
                });
            }).catch(() => {
                resolve({
                    citations,
                    references,
                });
            });
        }).catch(() => {
            axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((citeResponse) => {
                console.log('[Literature][querySemanticScholar] Got response for citations', citeResponse.data.data);
                citeResponse.data.data.forEach((paper) => {
                    if (paper.citingPaper.paperId) {
                        citations.push(formatSemanticScholarPaper(paper.citingPaper));
                    }
                });
                resolve({
                    citations,
                    references,
                });
            }).catch(() => {
                resolve({
                    citations,
                    references,
                });
            });
        });
    });
}

// function delay(time) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, time);
//     });
// }

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

function callOpenAlexAPI(location, parameters) {
    let query = '?';
    if (parameters) {
        Object.keys(parameters).forEach((key, index) => {
            if (index > 0) query += '&';
            query += `${key}=${parameters[key]}`;
        });
    }
    const finalUrl = `https://api.openalex.org${location + query}`;
    return new Promise((resolve, reject) => {
        console.log(finalUrl);
        axios.get(finalUrl)
            .then((response) => resolve(response))
            .catch((error) => reject(error));
    });
}

function gatherMetadataForKeys(keyType, keys, user) {
    return new Promise((resolve) => {
        const chunks = splitChunks(keys, 50);
        const responses = [];
        const queue = new Queue({
            concurrent: 1,
            interval: 100,
        });
        queue.on('resolve', (data) => {
            responses.push(data);
        });
        queue.on('end', () => {
            const results = [];
            responses.forEach((response) => {
                response.data.results.forEach((result) => {
                    results.push(result);
                });
            });
            resolve(results);
        });
        chunks.forEach((chunk) => {
            queue.enqueue(() => callOpenAlexAPI('/works', {
                filter: `${keyType}:${chunk.join('|')}`,
                mailto: user.email,
                'per-page': 50,
            }));
        });
    });
}

export function queryOpenAlex(dois, user) {
    // const citations = [];
    // const references = [];

    const processedDOIs = dois.map((doi) => (
        doi.startsWith('https://doi.org/')
            ? doi
            : `https://doi.org/${doi}`
    ));
    console.log(processedDOIs);

    gatherMetadataForKeys('doi', processedDOIs, user).then((results) => {
        console.log(results);
    });

    // return new Promise((resolve) => {
    //     axios.get(`https://api.openalex.org/works/https://doi.org/${processedDOI}?${mailto}`).then((response) => {
    //         console.log('[Literature][queryOpenAlex] Got response', response.data);
    //         const openAlexId = response.data.id.replace(/^https:\/\/openalex.org\//, '');

    //         // Get outgoing citations
    //         axios.get(`https://api.openalex.org/works?filter=cited_by:${openAlexId}${mailto}`).then((outResponse) => {
    //             console.log('[Literature][queryOpenAlex] outgoing', outResponse.data);
    //         });

    //         // Get incoming citations
    //         axios.get(`https://api.openalex.org/works?filter=cites:${openAlexId}${mailto}`).then((inResponse) => {
    //             console.log('[Literature][queryOpenAlex] incoming', inResponse.data);
    //         });

    //         // refResponse.data.data.forEach((paper) => {
    //         //     if (paper.citedPaper.paperId) {
    //         //         references.push(formatSemanticScholarPaper(paper.citedPaper));
    //         //     }
    //         // });

    //         // axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((citeResponse) => {
    //         //     console.log('[Literature][querySemanticScholar]
    //         // Got response for citations', citeResponse.data.data);
    //         //     citeResponse.data.data.forEach((paper) => {
    //         //         if (paper.citingPaper.paperId) {
    //         //             citations.push(formatSemanticScholarPaper(paper.citingPaper));
    //         //         }
    //         //     });
    //         //     resolve({
    //         //         citations,
    //         //         references,
    //         //     });
    //     }).catch(() => {
    //         resolve({
    //             citations,
    //             references,
    //         });
    //     });
    // }).catch(() => {
    //     // axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((citeResponse) => {
    //     //     console.log('[Literature][querySemanticScholar]
    //     // Got response for citations', citeResponse.data.data);
    //     //     citeResponse.data.data.forEach((paper) => {
    //     //         if (paper.citingPaper.paperId) {
    //     //             citations.push(formatSemanticScholarPaper(paper.citingPaper));
    //     //         }
    //     //     });
    //     //     resolve({
    //     //         citations,
    //     //         references,
    //     //     });
    //     // }).catch(() => {
    //     //     resolve({
    //     //         citations,
    //     //         references,
    //     //     });
    //     // });
    // });
}

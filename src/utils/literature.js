import axios from 'axios';

function formatSemanticScholarPaper(paper) {
    let { paperId } = paper;
    if (paper.externalIds && paper.externalIds.DOI) {
        paperId = paper.externalIds.DOI;
    }
    return {
        id: paperId,
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

export default function querySemanticScholar(doi) {
    const citations = [];
    const references = [];

    return new Promise((resolve) => {
        axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/references?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((refResponse) => {
            console.log('Got response for references', refResponse.data.data);
            refResponse.data.data.forEach((paper) => {
                if (paper.citedPaper.paperId) {
                    references.push(formatSemanticScholarPaper(paper.citedPaper));
                }
            });

            axios.get(`https://api.semanticscholar.org/graph/v1/paper/${doi}/citations?fields=title,url,abstract,authors,year,externalIds,venue,journal&limit=1000`).then((citeResponse) => {
                console.log('Got response for citations', citeResponse.data.data);
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
                console.log('Got response for citations', citeResponse.data.data);
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

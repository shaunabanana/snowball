// import readXlsxFile from 'read-excel-file'
// import bibtexParse from '@orcid/bibtex-parse-js';
import Cite from 'citation-js';

export function formatAuthors(authors) {
    if (authors.length >= 3) {
        return `${authors[0].family} et al.`;
    }
    if (authors.length === 2) {
        return `${authors[0].family} and ${authors[1].family}`;
    }
    if (authors.length === 1) {
        return `${authors[0].family}`;
    }
    return '';
}

function unArray(array) {
    if (!Array.isArray(array)) return array;
    let result = array[0];
    while (Array.isArray(result)) {
        const [firstElement] = result;
        result = firstElement;
    }
    return result;
}

// function unArrayLast(array) {
//     if (!Array.isArray(array)) return array;
//     let result = array[array.length - 1];
//     while (Array.isArray(result)) {
//         result = result[result.length - 1];
//     }
//     return result;
// }

function processCitationJs(fileContent, preprocess) {
    let toLoad = fileContent;
    if (preprocess) toLoad = fileContent.replace(/([^\\])\$/g, '$1\\$');
    const bib = Cite(toLoad);
    return bib.data.map((record) => {
        const originalRecord = { ...record };
        // eslint-disable-next-line no-underscore-dangle
        delete originalRecord._graph;
        // console.log('asdf', record);
        return {
            id: record.DOI ? record.DOI.toLowerCase() : record.id.toLowerCase(),
            doi: record.DOI,
            type: record.type,
            title: record.title,
            authors: record.author ? record.author : [],
            abstract: record.abstract,
            year: record.issued ? unArray(record.issued['date-parts']) : 'Unknown',
            keywords: record.keyword ? record.keyword.split(',').map((s) => s.trim()) : [],
            record: originalRecord,
        };
    });
}

export function processFile(content, preprocess) {
    return new Promise((resolve, reject) => {
        try {
            const result = processCitationJs(
                content,
                preprocess,
            );
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

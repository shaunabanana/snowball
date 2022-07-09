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

function processCitationJs(fileContent, preprocess) {
    let toLoad = fileContent;
    if (preprocess) toLoad = fileContent.replace(/([^\\])\$/g, '$1\\$');
    const bib = Cite(toLoad);
    return bib.data.map((record) => {
        const originalRecord = { ...record };
        // eslint-disable-next-line no-underscore-dangle
        delete originalRecord._graph;
        return {
            id: record.DOI ? record.DOI : record.id,
            doi: record.DOI,
            type: record.type,
            title: record.title,
            authors: record.author ? record.author : [],
            abstract: record.abstract,
            year: record.issued ? record.issued['date-parts'][0][0] : 'Unknown',
            keywords: record.keyword ? record.keyword.split(',').map((s) => s.trim()) : [],
            record: originalRecord,
        };
    });
}

export function processFile(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.addEventListener('load', (event) => {
            try {
                const result = processCitationJs(
                    event.target.result,
                    file.name.endsWith('.bib'),
                );
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
        reader.readAsText(file);
    });
    // else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
    //     readXlsxFile(files[0]).then((rows) => {
    //         console.log(rows[0]);
    //     });
    // }
}

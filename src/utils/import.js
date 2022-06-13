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

function processBibTex(fileContent) {
    const preprocessed = fileContent.replace(/([^\\])\$/g, '$1\\$');
    const bib = Cite(preprocessed);
    return bib.data.map((record) => ({
        id: record.DOI ? record.DOI : record.id,
        doi: record.DOI,
        type: record.type,
        title: record.title,
        authors: record.author ? record.author : [],
        abstract: record.abstract,
        year: record.issued ? record.issued['date-parts'][0][0] : 'Unknown',
        keywords: record.keyword ? record.keyword.split(',').map((s) => s.trim()) : [],
    }));
}

export function processFile(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        if (file.name.endsWith('.bib')) {
            reader.addEventListener('load', (event) => {
                resolve(processBibTex(event.target.result));
            });
            reader.readAsText(file);
        } else {
            reject(new Error('Currently Snowball only supports BibTeX files.'));
        }
    });
    // else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
    //     readXlsxFile(files[0]).then((rows) => {
    //         console.log(rows[0]);
    //     });
    // }
}

// import readXlsxFile from 'read-excel-file'
// import bibtexParse from '@orcid/bibtex-parse-js';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';

import { formatCitationJsRecord } from './common';

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
        return formatCitationJsRecord(record);
    });
}

export function processFile(content, preprocess) {
    return new Promise((resolve, reject) => {
        try {
            console.log(content);
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

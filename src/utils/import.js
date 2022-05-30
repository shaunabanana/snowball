// import readXlsxFile from 'read-excel-file'
// import bibtexParse from '@orcid/bibtex-parse-js';
import Cite from 'citation-js';

function processBibTex(fileContent) {
    const preprocessed = fileContent.replace(/([^\\])\$/g, '$1\\$');
    const bib = Cite(preprocessed);
    return bib.data.map(record => {
        return {
            id: record.id,
            type: record.type,
            title: record.title,
            authors: record.author ? record.author.map(author => `${author.given} ${author.family}`) : record.author,
            abstract: record.abstract,
            year: record.issued['date-parts'][0][0],
            keywords: record.keyword ? record.keyword.split(',').map(s => s.trim()) : [],
        }
    });
}

export function processFile(file) {
    const reader = new FileReader();

    if (file.name.endsWith(".bib")) {
        return new Promise(resolve => {
            reader.addEventListener('load', event => {
                // const result = bibtexParse.toJSON(event.target.result);
                // console.log(Cite(bibtexParse.toBibtex([result[0]]).replace(/([^\\])\$/g, '$1\\$')))
                resolve(processBibTex(event.target.result));
            })
            reader.readAsText(file);
        })
    }
    // if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
    //     readXlsxFile(files[0]).then((rows) => {
    //         console.log(rows[0]);
    //     });
    // } else 
}
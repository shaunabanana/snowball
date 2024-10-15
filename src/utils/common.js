export function unArray(array) {
    if (!Array.isArray(array)) return array;
    let result = array[0];
    while (Array.isArray(result)) {
        const [firstElement] = result;
        result = firstElement;
    }
    return result;
}

export function formatCitationJsRecord(record, supplementary) {
    supplementary = supplementary || {};

    const originalRecord = { ...record };
    // eslint-disable-next-line no-underscore-dangle
    delete originalRecord._graph;
    
    return {
        id: record.DOI ? record.DOI.toLowerCase() : record.id.toLowerCase(),
        doi: record.DOI,
        type: record.type,
        title: record.title,
        authors: record.author ? record.author : [],
        abstract: record.abstract || supplementary.abstract,
        year: record.issued 
                        ? unArray(record.issued['date-parts']) 
                        : (supplementary.year || "Unknown"),
        keywords: record.keyword ? record.keyword.split(',').map((s) => s.trim()) : [],
        record: originalRecord,
    };
}

export function formatPapers(papers) {
    papers.sort((a, b) => {
        if (typeof a.year === 'number' && typeof b.year === 'number') {
            return b.year - a.year;
        }
        if (typeof a.year === 'string' && typeof b.year === 'number') {
            return 1;
        }
        if (typeof a.year === 'number' && typeof b.year === 'string') {
            return -1;
        }
        return 0;
    });

    const processed = papers.map((paperData) => {
        const paper = { ...paperData };
        paper.tags = [];
        paper.include = false;
        paper.decision = 'undecided';
        paper.notes = '';
        paper.comments = [];
        paper.sheets = [];
        return paper;
    });
    return processed;
}
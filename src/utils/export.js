import Cite from 'citation-js';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { stringify } from 'csv-stringify/sync';

import { formatAuthors } from '@/utils/import';

export function exportBibTeX(state, paperIds) {
    const papers = paperIds.map((paperId) => {
        const paper = state.papers[paperId];
        const record = { ...paper.record };
        if (paper.notes && paper.notes.length > 0) {
            record.annote = [`Notes: ${paper.notes}`, record.annote];
        }
        if (paper.tags && paper.tags.length > 0) {
            const tagNames = [];
            if (paper.decision === 'include') {
                tagNames.push('Included');
            } else if (paper.decision === 'exclude') {
                tagNames.push('Excluded');
            } else if (paper.decision === 'undecided') {
                tagNames.push('Undecided');
            }
            paper.tags.forEach((tagId) => tagNames.push(state.tags[tagId].text));
            record.annote = `Tags: ${tagNames.join(', ')}\n\n${record.annote}`;
        }
        return record;
    });
    console.log(Cite(papers).format('bibtex'));
    return Cite(papers).format('bibtex');
}

export function exportRIS(state, paperIds) {
    const papers = paperIds.map((paperId) => {
        const paper = state.papers[paperId];
        const record = { ...paper.record };
        if (paper.notes && paper.notes.length > 0) {
            record.note = paper.notes;
        }
        if (paper.tags && paper.tags.length > 0) {
            const tagNames = [];
            if (paper.decision === 'include') {
                tagNames.push('Included');
            } else if (paper.decision === 'exclude') {
                tagNames.push('Excluded');
            } else if (paper.decision === 'undecided') {
                tagNames.push('Undecided');
            }
            paper.tags.forEach((tagId) => tagNames.push(state.tags[tagId].text));
            record.keyword = `${record.keyword},${tagNames.join(',')}`;
        }
        return record;
    });
    console.log(Cite(papers).format('ris'));
    return Cite(papers).format('ris');
}

export function exportCSV(state, paperIds) {
    const papers = paperIds.map((paperId) => state.papers[paperId]);
    const csv = [
        [
            'Title',
            'Authors',
            'Abstract',
            'Keywords',
            'DOI',
            'Year',
            'Tags',
            'Notes',
            'Container Title',
            'Collection Title',
            'Venue',
            'Journal',
        ],
    ];
    papers.forEach((paper) => {
        csv.push([
            paper.title,
            formatAuthors(paper.authors),
            paper.abstract,
            paper.keywords.join(', '),
            paper.doi,
            paper.year,
            paper.tags.join(', '),
            paper.notes,
            paper.record['container-title'],
            paper.record['collection-title'],
            paper.record.venue,
            paper.record.journal ? paper.record.journal.name : undefined,
        ]);
    });

    return stringify(csv);
}

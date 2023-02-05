/* eslint-disable no-restricted-globals */
import { processFile } from '@/utils/import';

function formatPapers(papers) {
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

self.onmessage = ({ data: { content, preprocess } }) => {
    processFile(content, preprocess)
        .then((processed) => {
            self.postMessage(formatPapers(processed));
        });
};

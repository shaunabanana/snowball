// import { processTags } from '@/utils/tags';
import { filter as runFilter } from '@/utils/search';
/* eslint-disable no-restricted-globals */
self.onmessage = ({ data }) => {
    const {
        papers, filter, method, tags, selection,
    } = JSON.parse(data);

    let selectedPapers = papers;
    // If selection is specified, then filter input data using
    if (Array.isArray(selection)) {
        selectedPapers = selectedPapers.filter(
            (paper) => selection.includes(paper.id),
        );
    }

    let filterResult = selectedPapers;
    if (filter && filter.length > 0) {
        filterResult = runFilter(
            method,
            papers,
            filter,
            ['title', 'abstract', 'keywords'],
            {},
        );
    }

    if (Array.isArray(tags) && tags.length > 0) {
        filterResult = filterResult.filter(
            (paper) => paper.tags.some((tag) => tags.includes(tag)),
        );
    }

    self.postMessage({
        papers,
        filtered: filterResult.map((paper) => paper.id),
    });
};

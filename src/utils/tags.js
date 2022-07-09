import { filter } from '@/utils/search';

export function processTags(state, paper) {
    const builtinTags = [];
    if (paper.decision === 'include') {
        builtinTags.push({
            type: 'builtin',
            color: 'green',
            text: 'Included',
        });
    }
    if (paper.decision === 'exclude') {
        builtinTags.push({
            type: 'builtin',
            color: 'gray',
            text: 'Excluded',
        });
    }
    if (paper.decision === 'undecided') {
        builtinTags.push({
            type: 'builtin',
            color: 'gray',
            text: 'Undecided',
        });
    }
    if (!paper.doi) {
        builtinTags.push({
            type: 'builtin',
            color: 'red',
            text: 'No DOI',
        });
    }
    if (!paper.abstract) {
        builtinTags.push({
            type: 'builtin',
            color: 'orange',
            text: 'No Abstract',
        });
    }

    // Convert tag IDs to tag objects, and filter out undefined ones.
    const paperTags = paper.tags.map((tag) => state.tags[tag]).filter((t) => t);
    paperTags.sort((a, b) => a.text.localeCompare(b.text));
    return builtinTags.concat(paperTags);
}

export function updateAutoTags(state) {
    const papers = Object.keys(state.papers).map((paperId) => state.papers[paperId]);
    Object.keys(state.tags).forEach((tagId) => {
        const tag = state.tags[tagId];
        if (tag.type !== 'auto') return;
        const result = filter(
            tag.method,
            papers,
            tag.filter,
            ['title', 'abstract', 'keywords', 'tags'],
            {
                tags: (tags, p) =>
                    // eslint-disable-next-line implicit-arrow-linebreak
                    processTags(state, p)
                        .map((t) => t.text)
                        .join(' '),
            },
        );
        result.forEach((paper) => {
            if (!paper.tags.includes(tagId)) paper.tags.push(tagId);
        });
    });

    Object.keys(state.papers).forEach((paperId) => {
        const paper = state.papers[paperId];
        paper.tags = paper.tags.filter((tagId) => state.tags[tagId]);
    });
}

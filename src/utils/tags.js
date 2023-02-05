import { filter } from '@/utils/search';

export function processTags(state, paper) {
    const builtinTags = [];
    if (paper.decision === 'include') {
        builtinTags.push({
            id: 'Included',
            type: 'builtin',
            color: 'green',
            text: 'Included',
        });
    }
    if (paper.decision === 'exclude') {
        builtinTags.push({
            id: 'Excluded',
            type: 'builtin',
            color: 'gray',
            text: 'Excluded',
        });
    }
    if (paper.decision === 'undecided') {
        builtinTags.push({
            id: 'Undecided',
            type: 'builtin',
            color: 'gray',
            text: 'Undecided',
        });
    }
    if (!paper.doi) {
        builtinTags.push({
            id: 'No DOI',
            type: 'builtin',
            color: 'red',
            text: 'No DOI',
        });
    }
    if (!paper.abstract) {
        builtinTags.push({
            id: 'No Abstract',
            type: 'builtin',
            color: 'orange',
            text: 'No Abstract',
        });
    }

    // Convert tag IDs to tag objects, and filter out undefined ones.
    const paperTags = paper.tags.map((tagId) => state.tag(tagId)).filter((t) => t);
    paperTags.sort((a, b) => a.text.localeCompare(b.text));
    return builtinTags.concat(paperTags);
}

export function updateAutoTags(state, papers) {
    // const papers = Object.keys(state.papers).map((paperId) => state.papers[paperId]);
    state.tags.forEach((tag) => {
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
            if (!paper.tags.includes(tag.id)) paper.tags.push(tag.id);
        });
    });

    papers.forEach((paper) => {
        // eslint-disable-next-line no-param-reassign
        paper.tags = paper.tags.filter((tagId) => state.tags[tagId]);
    });
}

export function updateTagIds(state) {
    // Create a mapping between old ids and new ids
    const mergedTags = [];
    const existingTags = [];
    const idMap = {};
    state.tags.forEach((tag) => {
        if (tag.type === 'text') {
            idMap[tag.id] = tag.text;
            // eslint-disable-next-line no-param-reassign
            tag.id = tag.text;
        }
        if (!existingTags.includes(tag.id)) {
            existingTags.push(tag.id);
            mergedTags.push(tag);
        }
    });

    // Update all paper tag records, merging the ones with the same text.
    state.sheets.forEach((sheet) => {
        if (!sheet.data.edits) return;
        Object.keys(sheet.data.edits).forEach((paperId) => {
            const edits = sheet.data.edits[paperId];
            if (edits.tags) {
                // console.log(paperId, edits.tags);
                const newPaperTags = new Set(edits.tags.map((tagId) => {
                    console.log(tagId, idMap[tagId]);
                    if (idMap[tagId]) return idMap[tagId];
                    return tagId;
                }));
                newPaperTags.delete(null);
                // console.log(newPaperTags);
                edits.tags = [...newPaperTags];
            }
        });
    });

    state.tags = mergedTags;
}

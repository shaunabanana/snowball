import { compare } from 'compare-versions';
import { updateTagIds } from '@/utils/tags';

function convertZeroOneXToOneOneX(state, data) {
    /*
        This project is created with Snowball version 0.1.X.
        There are three updates needed:
        1. Decisions that are false should be marked as 'undecided'.
        2. Tags should be reformatted.
        3. Tags should be moved from inside papers to project level.
    */
    const newData = {
        version: state.version,
        projectPath: data.projectPath,
        sheets: data.sheets,
        papers: {},
        tags: {},
    };

    Object.keys(data.papers).forEach((paperId) => {
        const paper = { ...data.papers[paperId] };

        // Decisions that are false should be marked as 'undecided'.
        paper.decision = paper.include ? 'include' : 'undecided';
        delete paper.include;

        const paperTags = [];
        paper.tags.forEach((tagData) => {
            // Tags should be reformatted.
            let tagId;
            let tagText;
            if (!tagData.text && typeof tagData === 'string') {
                tagId = tagData;
                tagText = tagData;
            } else if (tagData.text) {
                tagId = tagData.text;
                tagText = tagData.text;
            } else {
                return;
            }
            // const tagId = tagData.text;
            const tag = {
                id: tagId,
                type: 'text',
                color: 'blue',
                text: tagText,
            };
                // Tags should be moved from inside papers to project level.
            paperTags.push(tagId);
            newData.tags[tagId] = tag;
        });
        paper.tags = [...new Set(paperTags)];

        newData.papers[paperId] = paper;
    });

    return newData;
}

function convertOneOneXToOneTwoX(state, data) {
    /*
        This project is created with Snowball version 1.1.X.
        There is two updates needed:
        1. Merge tags with the same text (use text as ID).
        2. Update all paper tag records with the same text.
    */
    console.log('[Compatibility][1.1.X → 1.2.X] Merging tags with duplicate text but different IDs.');
    const newData = {
        version: state.version,
        projectPath: data.projectPath,
        sheets: data.sheets,
        papers: data.papers,
        tags: data.tags,
    };

    // This function does both at the same time.
    updateTagIds(newData);
    return newData;
}

export function convertFromOlderVersion(state, data) {
    let converted = data;
    if (!data.version) {
        converted = convertZeroOneXToOneOneX(state, converted);
    }

    if (compare(data.version, '1.2.0', '<') && compare(state.version, '1.3.0', '<')) {
        converted = convertOneOneXToOneTwoX(state, converted);
    }

    return converted;
}

export function checkCompatibility(state, data) {
    if (!data.version) {
        return {
            needConversion: true,
            backwardsCompatible: false,
        };
    }

    if (compare(data.version, '1.2.0', '<') && compare(state.version, '1.3.0', '<')) {
        return {
            needConversion: true,
            backwardsCompatible: true,
        };
    }

    return {
        needConversion: false,
        backwardsCompatible: true,
    };
}

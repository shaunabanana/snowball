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

function convertOneOneXToOneTwoZero(state, data) {
    /*
        This project is created with Snowball version 1.1.X.
        There is two updates needed:
        1. Merge tags with the same text (use text as ID).
        2. Update all paper tag records with the same text.
    */
    console.log('[Compatibility][1.1.X → 1.2.0] Merging tags with duplicate text but different IDs.');
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

function convertOneTwoZeroToOneTwoX(state, data) {
    /*
        This project is created with Snowball version 1.2.0.
        There is only one update needed:
        1. Convert all paper IDs to lowercase.
    */
    console.log('[Compatibility][1.2.0 → 1.2.1] Converting all paper IDs to lowercase.');
    const newData = {
        version: state.version,
        projectPath: data.projectPath,
        sheets: data.sheets,
        papers: data.papers,
        tags: data.tags,
    };

    const newPapers = {};
    Object.keys(newData.papers).forEach((paperId) => {
        const newPaperId = paperId.toLowerCase();
        newPapers[newPaperId] = newData.papers[paperId];
        newPapers[newPaperId].id = newPaperId;
    });
    newData.papers = newPapers;

    Object.keys(newData.sheets).forEach((sheetId) => {
        const sheet = newData.sheets[sheetId];
        sheet.papers = sheet.papers.map((paperId) => paperId.toLowerCase());
    });

    return newData;
}

export function convertFromOlderVersion(state, data) {
    let converted = data;
    if (!data.version) {
        converted = convertZeroOneXToOneOneX(state, converted);
    }

    if (compare(data.version, '1.2.0', '<')) {
        converted = convertOneOneXToOneTwoZero(state, converted);
    }

    if (compare(data.version, '1.2.0', '=')) {
        converted = convertOneTwoZeroToOneTwoX(state, converted);
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

    if (compare(data.version, '1.2.0', '<')) {
        return {
            needConversion: true,
            backwardsCompatible: true,
        };
    }

    if (compare(data.version, '1.2.0', '=')) {
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

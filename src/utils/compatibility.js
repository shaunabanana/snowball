export default function convertFromOlderVersion(state, data) {
    if (!data.version) {
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
    return data;
}

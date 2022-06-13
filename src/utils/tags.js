export default function processTags(paper) {
    const dynamicTags = [];
    if (!paper.doi) {
        dynamicTags.push({
            type: 'danger', text: 'No DOI',
        });
    }
    if (!paper.abstract) {
        dynamicTags.push({
            type: 'warning', text: 'No Abstract',
        });
    }
    return dynamicTags.concat(paper.tags);
}

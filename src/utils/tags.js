export function processTags(paper) {
  const dynamicTags = [];
  if (paper.include)
    dynamicTags.push({
      type: "success",
      text: "Included",
    });
  if (!paper.doi)
    dynamicTags.push({
      type: "danger",
      text: "No DOI",
    });
  if (!paper.abstract)
    dynamicTags.push({
      type: "warning",
      text: "No Abstract",
    });
  return dynamicTags.concat(paper.tags);
}

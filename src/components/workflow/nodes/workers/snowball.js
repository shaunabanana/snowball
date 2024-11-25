// import { querySemanticScholar } from '@/utils/snowball';

// /* eslint-disable no-restricted-globals */
// self.onmessage = ({ data }) => {
//     const { papers, selection, getCitations, getReferences, includeArxiv } = JSON.parse(data);

//     let selectedPapers = papers;
//     // If selection is specified, then filter input data using
//     if (Array.isArray(selection)) {
//         selectedPapers = selectedPapers.filter(
//             (paper) => selection.includes(paper.id),
//         );
//     }

//     const dois = selectedPapers.filter((p) => p.doi).map((p) => p.doi);

//     querySemanticScholar(
//         dois, 
//         this.data.getCitations, 
//         this.data.getReferences, 
//         this.data.includeArxiv
//     ).then((results) => {
//         self.postMessage(result);

//         // nodeData.loading = false;
//         // this.handleInput();
//     }).catch(() => {
//         // nodeData.loading = false;
//     });
// };

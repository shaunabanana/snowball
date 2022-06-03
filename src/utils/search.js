import { parse } from '@spaceavocado/librarian'


export function filter(papers, query, fields) {
    if (!fields) fields = ['title', 'abstract', 'keywords', 'tags'];
    console.log(fields);
    const search = parse(query).execute;
    const results = [];

    for (const paper of papers) {
        for (let field of fields) {
            if (!paper[field]) continue;

            let searchData = Array.isArray(paper[field]) ? paper[field].join(' ') : paper[field];
            // console.log(searchData);
            const match = search(searchData);
            if (match) {
                results.push(paper);
                break;
            }
        }
    }
    return results;
}
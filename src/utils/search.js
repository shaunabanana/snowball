import { parse } from '@spaceavocado/librarian'


export function filter(papers, query, fields) {
    if (!fields) fields = ['title', 'abstract'];
    const search = parse(query).execute;
    const results = [];

    for (const paper of papers) {
        for (let field of fields) {
            if (!paper[field]) continue;
            const match = search(paper[field]);
            if (match) {
                results.push(paper);
                break;
            }
        }
    }
    return results;
}
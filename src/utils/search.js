import { parse } from '@spaceavocado/librarian';

function booleanFilter(papers, query, fields, formatters) {
    if (!fields) fields = ['title', 'abstract', 'keywords', 'tags'];
    
    try {
        const search = parse(query).execute;
        const results = [];

        for (const paper of papers) {
            for (let field of fields) {
                if (!paper || !paper[field]) continue;

                let searchData = paper[field];
                if (Array.isArray(paper[field])) {
                    if (formatters[field]) {
                        searchData = formatters[field](paper[field], paper)
                    } else {
                        searchData = paper[field].join(' ');
                    }
                }
                // console.log(searchData);
                const match = search(searchData);
                if (match) {
                    results.push(paper);
                    break;
                }
            }
        }
        return results;
    } catch {
        return [];
    }
}

function regexFilter(papers, query, fields, formatters) {
    if (!fields) fields = ['title', 'abstract', 'keywords', 'tags'];
    try {
        const search = new RegExp(query);
        const results = [];

        for (const paper of papers) {
            for (let field of fields) {
                if (!paper || !paper[field]) continue;

                let searchData = paper[field];
                if (Array.isArray(paper[field])) {
                    if (formatters[field]) {
                        searchData = formatters[field](paper[field], paper)
                    } else {
                        searchData = paper[field].join(' ');
                    }
                }
                const match = search.test(searchData);
                if (match) {
                    results.push(paper);
                    break;
                }
            }
        }
        return results;
    } catch {
        return [];
    }
}


export function filter(method, papers, query, fields, formatters) {
    if (method === 'boolean') {
        return booleanFilter(papers, query, fields, formatters);
    } else if (method === 'regex') {
        return regexFilter(papers, query, fields, formatters);
    }
}

function booleanMatch(text, query) {
    try {
        const search = parse(query).execute;
        const result = search(text);
        if (result) {
            return result.map(match => ({
                start: match.index,
                length: match.length
            }));
        } else {
            return false;
        }
    } catch {
        return [];
    }
}

export function match(method, text, query) {
    if (method === 'boolean') {
        return booleanMatch(text, query);
    }
}
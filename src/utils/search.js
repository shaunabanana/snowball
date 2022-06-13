import { parse } from '@spaceavocado/librarian';

function booleanFilter(papers, query, fields, formatters) {
    const searchFields = fields || ['title', 'abstract', 'keywords', 'tags'];

    try {
        const search = parse(query).execute;
        const results = [];

        papers.forEach((paper) => {
            searchFields.some((field) => {
                if (!paper || !paper[field]) return false;

                let searchData = paper[field];
                if (Array.isArray(paper[field])) {
                    if (formatters[field]) {
                        searchData = formatters[field](paper[field], paper);
                    } else {
                        searchData = paper[field].join(' ');
                    }
                }
                // console.log(searchData);
                const matches = search(searchData);
                if (matches) {
                    results.push(paper);
                    return true;
                }
                return false;
            });
        });
        return results;
    } catch {
        return [];
    }
}

function regexFilter(papers, query, fields, formatters) {
    const searchFields = fields || ['title', 'abstract', 'keywords', 'tags'];

    try {
        const search = new RegExp(query);
        const results = [];

        papers.forEach((paper) => {
            searchFields.some((field) => {
                if (!paper || !paper[field]) return false;

                let searchData = paper[field];
                if (Array.isArray(paper[field])) {
                    if (formatters[field]) {
                        searchData = formatters[field](paper[field], paper);
                    } else {
                        searchData = paper[field].join(' ');
                    }
                }
                const matches = search.test(searchData);
                if (matches) {
                    results.push(paper);
                    return true;
                }
                return false;
            });
        });
        return results;
    } catch {
        return [];
    }
}

export function filter(method, papers, query, fields, formatters) {
    if (method === 'boolean') {
        return booleanFilter(papers, query, fields, formatters);
    } if (method === 'regex') {
        return regexFilter(papers, query, fields, formatters);
    }
    return [];
}

function booleanMatch(text, query) {
    try {
        const search = parse(query).execute;
        const results = search(text);
        if (results) {
            return results.map((result) => ({
                start: result.index,
                length: result.length,
            }));
        }
        return false;
    } catch {
        return [];
    }
}

export function match(method, text, query) {
    if (method === 'boolean') {
        return booleanMatch(text, query);
    }
    return [];
}

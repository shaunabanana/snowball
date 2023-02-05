import { Query } from 'bibliothecary';

function booleanFilter(papers, query, fields, formatters) {
    const searchFields = fields || ['title', 'abstract', 'keywords', 'tags'];

    // try {
    const queryMatcher = new Query(query);
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
            const matches = queryMatcher.search(searchData);
            if (matches) {
                results.push(paper);
                return true;
            }
            return false;
        });
    });
    return results;
    // } catch {
    //     return [];
    // }
}

function regexFilter(papers, query, fields, formatters) {
    // function regexFilter(papers, query) {
    const searchFields = fields || ['title', 'abstract', 'keywords', 'tags'];

    // try {
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
            // console.log(searchData, matches);
            if (matches) {
                results.push(paper);
                return true;
            }
            return false;
        });
    });
    return results;
    // } catch {
    //     return [];
    // }
}

export function filter(method, papers, query, fields, formatters) {
    if (method.toLowerCase() === 'boolean') {
        return booleanFilter(papers, query, fields, formatters || {});
    }
    if (method.toLowerCase() === 'regexp') {
        return regexFilter(papers, query, fields, formatters || {});
    }
    return [];
}

function booleanMatch(text, query) {
    // try {
    const queryMatcher = new Query(query);
    const results = queryMatcher.search(text);
    if (results) {
        console.log(results);
        return results.map((result) => ({
            start: result.start,
            length: result.length,
        }));
    }
    return false;
    // } catch {
    //     return [];
    // }
}

export function match(method, text, query) {
    if (method.toLowerCase() === 'boolean') {
        return booleanMatch(text, query);
    }
    return [];
}

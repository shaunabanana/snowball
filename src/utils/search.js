import { Query } from "bibliothecary";

function booleanFilter(papers, query, fields, formatters) {
  if (!fields) fields = ["title", "abstract", "keywords", "tags"];

  try {
    const queryMatcher = new Query(query);
    const results = [];

    for (const paper of papers) {
      for (let field of fields) {
        if (!paper || !paper[field]) continue;

        let searchData = paper[field];
        if (Array.isArray(paper[field])) {
          if (formatters[field]) {
            searchData = formatters[field](paper[field], paper);
          } else {
            searchData = paper[field].join(" ");
          }
        }
        const matches = queryMatcher.search(searchData);
        if (matches) {
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
  if (!fields) fields = ["title", "abstract", "keywords", "tags"];
  try {
    const search = new RegExp(query);
    const results = [];

    for (const paper of papers) {
      for (let field of fields) {
        if (!paper || !paper[field]) continue;

        let searchData = paper[field];
        if (Array.isArray(paper[field])) {
          if (formatters[field]) {
            searchData = formatters[field](paper[field], paper);
          } else {
            searchData = paper[field].join(" ");
          }
        }
        const matches = search.test(searchData);
        if (matches) {
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
  if (method === "boolean") {
    return booleanFilter(papers, query, fields, formatters);
  } else if (method === "regex") {
    return regexFilter(papers, query, fields, formatters);
  }
  return [];
}

function booleanMatch(text, query) {
  try {
    const queryMatcher = new Query(query);
    const results = queryMatcher.search(text);
    if (results) {
      return results.map((match) => ({
        start: match.start,
        length: match.length,
      }));
    } else {
      return false;
    }
  } catch {
    return [];
  }
}

export function match(method, text, query) {
  if (method === "boolean") {
    return booleanMatch(text, query);
  }
  return [];
}

import { Parser, Grammar } from 'nearley';

import grammar from './grammar';

function formatWildcards(query) {
    return query.replace('*', '[^ \\t\\n\\r]*')
        .replace('?', '[^ \\t\\n\\r]');
}

export default class Query {
    constructor(query) {
        this.parser = new Parser(Grammar.fromCompiled(grammar));
        this.parser.feed(query);
        this.tree = this.parser.results;

        this.operators = {
            AND: this.andOperator.bind(this),
            OR: this.orOperator.bind(this),
            NOT: this.notOperator.bind(this),
            NEAR: Query.nearOperator.bind(this),
            ONEAR: Query.orderedNearOperator.bind(this),
            TERM: Query.termOperator.bind(this),
        };
    }

    search(text) {
        // console.log(this.tree[0]);
        return this.operators[this.tree[0].type](
            text,
            this.tree[0].left,
            this.tree[0].right,
            this.tree[0].parameter,
        );
    }

    andOperator(text, left, right) {
        // console.log('AND', text, left, right);
        let matches = [];

        const leftResult = this.operators[left.type](text, left.left, left.right, left.parameter);
        if (leftResult) matches = matches.concat(leftResult);
        else return false;

        const rightResult = this.operators[right.type](
            text,
            right.left,
            right.right,
            right.parameter,
        );
        if (rightResult) matches = matches.concat(rightResult);
        else return false;

        return matches;
    }

    orOperator(text, left, right) {
        // console.log('OR', text, left, right);
        let matches = [];

        const leftResult = this.operators[left.type](text, left.left, left.right, left.parameter);
        if (leftResult) matches = matches.concat(leftResult);

        const rightResult = this.operators[right.type](
            text,
            right.left,
            right.right,
            right.parameter,
        );
        if (rightResult) matches = matches.concat(rightResult);

        return matches.length > 0 ? matches : false;
    }

    notOperator(text, _, right) {
        // console.log('NOT', text, right);
        const result = this.operators[right.type](text, right.left, right.right, right.parameter);
        return result ? false : [];
    }

    static nearOperator(text, left, right, distance) {
        // console.log('NEAR', this, text, left, right, distance);
        let currentStart = 0;
        const textWords = text.split(' ').map((word) => {
            const wordData = {
                text: word,
                start: currentStart,
                length: word.length,
            };
            currentStart += word.length + 1;
            return wordData;
        });
        const leftMatches = [];
        const rightMatches = [];
        const result = [];

        textWords.forEach((word, index) => {
            const leftRegexp = new RegExp(formatWildcards(left.right[0]));
            const rightRegexp = new RegExp(formatWildcards(right.right[0]));
            if (leftRegexp.test(word.text)) {
                leftMatches.push({
                    text: word.text,
                    location: index,
                    start: word.start,
                    length: word.length,
                });
            }
            if (rightRegexp.test(word.text)) {
                rightMatches.push({
                    text: word.text,
                    location: index,
                    start: word.start,
                    length: word.length,
                });
            }
        });

        // console.log(leftMatches, rightMatches);

        leftMatches.forEach((leftMatch) => {
            rightMatches.forEach((rightMatch) => {
                if (Math.abs(leftMatch.location - rightMatch.location) <= distance) {
                    result.push({
                        term: left.right[0],
                        text: leftMatch.text,
                        start: leftMatch.start,
                        length: leftMatch.length,
                    });
                    result.push({
                        term: right.right[0],
                        text: rightMatch.text,
                        start: rightMatch.start,
                        length: rightMatch.length,
                    });
                }
            });
        });

        return result.length > 0 ? result : false;
    }

    static orderedNearOperator(text, left, right, distance) {
        // console.log('NEAR', this, text, left, right, distance);
        let currentStart = 0;
        const textWords = text.split(' ').map((word) => {
            const wordData = {
                text: word,
                start: currentStart,
                length: word.length,
            };
            currentStart += word.length + 1;
            return wordData;
        });
        const leftMatches = [];
        const rightMatches = [];
        const result = [];

        textWords.forEach((word, index) => {
            const leftRegexp = new RegExp(formatWildcards(left.right[0]));
            const rightRegexp = new RegExp(formatWildcards(right.right[0]));
            if (leftRegexp.test(word.text)) {
                leftMatches.push({
                    text: word.text,
                    location: index,
                    start: word.start,
                    length: word.length,
                });
            }
            if (rightRegexp.test(word.text)) {
                rightMatches.push({
                    text: word.text,
                    location: index,
                    start: word.start,
                    length: word.length,
                });
            }
        });

        // console.log(leftMatches, rightMatches);

        leftMatches.forEach((leftMatch) => {
            rightMatches.forEach((rightMatch) => {
                if (
                    leftMatch.location < rightMatch.location
                    && rightMatch.location - leftMatch.location <= distance
                ) {
                    result.push({
                        term: left.right[0],
                        text: leftMatch.text,
                        start: leftMatch.start,
                        length: leftMatch.length,
                    });
                    result.push({
                        term: right.right[0],
                        text: rightMatch.text,
                        start: rightMatch.start,
                        length: rightMatch.length,
                    });
                }
            });
        });

        return result.length > 0 ? result : false;
    }

    static termOperator(text, _, words, quoted) {
        // console.log('TERM', this, text, words);
        const result = [];
        if (quoted) {
            const query = formatWildcards(words.join(' +'));
            const regexp = new RegExp(query, 'g');
            const matches = [...text.matchAll(regexp)];
            if (matches) {
                // console.log(matches);
                matches.forEach((match) => {
                    result.push({
                        term: `"${words.join(' ')}"`,
                        text: match[0],
                        start: match.index,
                        length: match[0].length,
                    });
                });
            }
        } else {
            words.forEach((word) => {
                const query = formatWildcards(word);
                const regexp = new RegExp(query, 'g');
                const matches = [...text.matchAll(regexp)];
                if (matches) {
                    // console.log(matches);
                    matches.forEach((match) => {
                        result.push({
                            term: word,
                            text: match[0],
                            start: match.index,
                            length: match[0].length,
                        });
                    });
                }
            });
        }
        return result.length > 0 ? result : false;
    }
}

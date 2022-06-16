const nearley = require('nearley');
const grammar = require('./grammar');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

// parser.feed('one one AND "two two"');
// parser.feed('one one AND "two two" OR three');
// parser.feed('one one AND "two two" OR three AND four');
// parser.feed('NOT one one AND "two two" OR three AND four');
// parser.feed('NOT (NOT one one AND "two two" OR three AND four)');
// parser.feed('NOT (NOT one one AND "two two" OR three AND four) AND five');
// parser.feed('NOT (NOT one one AND "two two" OR three AND four) AND (five NEAR/3 six)');
// parser.feed(
//     'NOT (NOT one one AND "two two" OR three AND four) AND (five NEAR/3 six) AND se?en AND eigh*'
// );
parser.feed('one one ONEAR/3 "two two"');

console.log(JSON.stringify(parser.results[0], null, 2));

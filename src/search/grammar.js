// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
    WS:      /[ \t]+/,
    and: ['and', 'AND'],
    or: ['or', 'OR'],
    not: ['not', 'NOT'],
    onear: {
        match: /(?:onear|ONEAR)\/(?:[0-9]|[1-9][0-9]+)/,
        value: s => Number.parseInt(s.split('/')[1])
    },
    near: {
        match: /(?:near|NEAR)\/(?:[0-9]|[1-9][0-9]+)/,
        value: s => Number.parseInt(s.split('/')[1])
    },
    word:  /[^'"() \t\n\r/"]+/,
    quote:  /['"]/,
    lparen:  '(',
    rparen:  ')',
    NL:      { match: /[\n\r]/, lineBreaks: true },
});


const unArray = function (array) {
    let current = array;
    while (Array.isArray(current)) {
        current = current[0];
    }
    return current;
}
const appendItem = function (a, b) {
    return function (d) { 
        return d[a].concat([d[b]]); 
    } 
};

const operatorizeOneOperand = function (data) {
    return {
        type: data[0].type.toUpperCase(),
        right: unArray(data[2])
    }; 
};

const operatorizeTwoOperands = function (data) {
    return {
        type: data[2].type.toUpperCase(),
        parameter: data[2].type === 'near' || data[2].type === 'onear' ? data[2].value : undefined,
        left: unArray(data[0]),
        right: unArray(data[4]),
    }; 
};

const processParentheses = function (data) {
    return data[2]; 
};

const processUnquotedTerm = function (data) { 
    return {
        type: 'TERM',
        parameter: false,
        right: data[0].map(word => word.value.toLowerCase())
    }; 
};

const processQuotedTerm = function (data) {
    return {
        type: 'TERM',
        parameter: true,
        right: data[2].map(word => word.value.toLowerCase())
    }; 
};
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["or_clause"], "postprocess": unArray},
    {"name": "or_clause$ebnf$1", "symbols": ["ws"]},
    {"name": "or_clause$ebnf$1", "symbols": ["or_clause$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "or_clause$ebnf$2", "symbols": ["ws"]},
    {"name": "or_clause$ebnf$2", "symbols": ["or_clause$ebnf$2", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "or_clause", "symbols": ["or_clause", "or_clause$ebnf$1", (lexer.has("or") ? {type: "or"} : or), "or_clause$ebnf$2", "or_clause"], "postprocess": operatorizeTwoOperands},
    {"name": "or_clause", "symbols": ["and_clause"]},
    {"name": "and_clause$ebnf$1", "symbols": ["ws"]},
    {"name": "and_clause$ebnf$1", "symbols": ["and_clause$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "and_clause$ebnf$2", "symbols": ["ws"]},
    {"name": "and_clause$ebnf$2", "symbols": ["and_clause$ebnf$2", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "and_clause", "symbols": ["and_clause", "and_clause$ebnf$1", (lexer.has("and") ? {type: "and"} : and), "and_clause$ebnf$2", "and_clause"], "postprocess": operatorizeTwoOperands},
    {"name": "and_clause", "symbols": ["not_clause"]},
    {"name": "not_clause$ebnf$1", "symbols": ["ws"]},
    {"name": "not_clause$ebnf$1", "symbols": ["not_clause$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "not_clause", "symbols": [(lexer.has("not") ? {type: "not"} : not), "not_clause$ebnf$1", "not_clause"], "postprocess": operatorizeOneOperand},
    {"name": "not_clause", "symbols": ["near_clause"]},
    {"name": "near_clause$ebnf$1", "symbols": ["ws"]},
    {"name": "near_clause$ebnf$1", "symbols": ["near_clause$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "near_clause$ebnf$2", "symbols": ["ws"]},
    {"name": "near_clause$ebnf$2", "symbols": ["near_clause$ebnf$2", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "near_clause", "symbols": ["term", "near_clause$ebnf$1", (lexer.has("near") ? {type: "near"} : near), "near_clause$ebnf$2", "term"], "postprocess": operatorizeTwoOperands},
    {"name": "near_clause", "symbols": ["onear_clause"]},
    {"name": "onear_clause$ebnf$1", "symbols": ["ws"]},
    {"name": "onear_clause$ebnf$1", "symbols": ["onear_clause$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "onear_clause$ebnf$2", "symbols": ["ws"]},
    {"name": "onear_clause$ebnf$2", "symbols": ["onear_clause$ebnf$2", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "onear_clause", "symbols": ["term", "onear_clause$ebnf$1", (lexer.has("onear") ? {type: "onear"} : onear), "onear_clause$ebnf$2", "term"], "postprocess": operatorizeTwoOperands},
    {"name": "onear_clause", "symbols": ["paren_clause"]},
    {"name": "paren_clause$ebnf$1", "symbols": []},
    {"name": "paren_clause$ebnf$1", "symbols": ["paren_clause$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "paren_clause$ebnf$2", "symbols": []},
    {"name": "paren_clause$ebnf$2", "symbols": ["paren_clause$ebnf$2", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "paren_clause", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "paren_clause$ebnf$1", "or_clause", "paren_clause$ebnf$2", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": processParentheses},
    {"name": "paren_clause", "symbols": ["term"]},
    {"name": "term", "symbols": ["unquoted_term"], "postprocess": processUnquotedTerm},
    {"name": "term$ebnf$1", "symbols": []},
    {"name": "term$ebnf$1", "symbols": ["term$ebnf$1", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "term$ebnf$2", "symbols": []},
    {"name": "term$ebnf$2", "symbols": ["term$ebnf$2", "ws"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "term", "symbols": [(lexer.has("quote") ? {type: "quote"} : quote), "term$ebnf$1", "quoted_term", "term$ebnf$2", (lexer.has("quote") ? {type: "quote"} : quote)], "postprocess": processQuotedTerm},
    {"name": "unquoted_term", "symbols": [(lexer.has("word") ? {type: "word"} : word)]},
    {"name": "unquoted_term", "symbols": ["unquoted_term", "ws", (lexer.has("word") ? {type: "word"} : word)], "postprocess": appendItem(0,2)},
    {"name": "quoted_term", "symbols": [(lexer.has("word") ? {type: "word"} : word)]},
    {"name": "quoted_term", "symbols": ["quoted_term", "ws", (lexer.has("word") ? {type: "word"} : word)], "postprocess": appendItem(0,2)},
    {"name": "quoted_term$subexpression$1", "symbols": [(lexer.has("and") ? {type: "and"} : and)]},
    {"name": "quoted_term$subexpression$1", "symbols": [(lexer.has("or") ? {type: "or"} : or)]},
    {"name": "quoted_term$subexpression$1", "symbols": [(lexer.has("not") ? {type: "not"} : not)]},
    {"name": "quoted_term", "symbols": ["quoted_term", "ws", "quoted_term$subexpression$1"], "postprocess": appendItem(0,2)},
    {"name": "ws", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": d => null}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

@{%
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
%}

@{%
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
%}

@lexer lexer

main          -> or_clause  {% unArray %}

or_clause       -> or_clause ws:+ %or ws:+ or_clause  {% operatorizeTwoOperands %}
                 | and_clause

and_clause      -> and_clause ws:+ %and ws:+ and_clause {% operatorizeTwoOperands %}
                 | not_clause

not_clause      -> %not ws:+ not_clause                    {% operatorizeOneOperand %}
                 | near_clause

near_clause     -> term ws:+ %near ws:+ term {% operatorizeTwoOperands %}
                 | onear_clause

onear_clause    -> term ws:+ %onear ws:+ term {% operatorizeTwoOperands %}
                 | paren_clause

paren_clause    -> %lparen ws:* or_clause ws:* %rparen  {% processParentheses %}
                 | term

term            -> unquoted_term                    {% processUnquotedTerm %}
                 | %quote ws:* quoted_term ws:* %quote        {% processQuotedTerm %}

unquoted_term   -> %word                            
                 | unquoted_term ws %word          {% appendItem(0,2) %}

quoted_term     -> %word                            
                 | quoted_term ws %word            {% appendItem(0,2) %}
                 | quoted_term ws (%and|%or|%not)  {% appendItem(0,2) %}

ws              -> %WS                              {% d => null %}


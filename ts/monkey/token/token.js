"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookUpIdent = exports.ILLEGAL = exports.EOF = exports.NULL = exports.FALSE = exports.TRUE = exports.ELSE = exports.IF = exports.RETURN = exports.FUNCTION = exports.LET = exports.NOT_EQ = exports.EQ = exports.INT = exports.IDENT = exports.RPAREN = exports.LPAREN = exports.RBRACE = exports.LBRACE = exports.BANG = exports.LT = exports.GT = exports.ASSIGN = exports.SLASH = exports.ASTERISK = exports.MINUS = exports.PLUS = exports.SEMICOLON = exports.COMMA = void 0;
exports.COMMA = ",";
exports.SEMICOLON = ";";
exports.PLUS = "+";
exports.MINUS = "-";
exports.ASTERISK = "*";
exports.SLASH = "/";
exports.ASSIGN = "=";
exports.GT = "<";
exports.LT = ">";
exports.BANG = "!";
exports.LBRACE = "{";
exports.RBRACE = "}";
exports.LPAREN = "(";
exports.RPAREN = ")";
exports.IDENT = "IDENT";
exports.INT = "INT";
exports.EQ = "==";
exports.NOT_EQ = "!=";
exports.LET = "LET";
exports.FUNCTION = "FUNCTION";
exports.RETURN = "RETURN";
exports.IF = "IF";
exports.ELSE = "ELSE";
exports.TRUE = "TRUE";
exports.FALSE = "FALSE";
exports.NULL = "NULL";
exports.EOF = "EOF";
exports.ILLEGAL = "ILLEGAL";
var keywords = new Map([
    ["fn", exports.FUNCTION],
    ["let", exports.LET],
    ["true", exports.TRUE],
    ["false", exports.FALSE],
    ["null", exports.NULL],
    ["if", exports.IF],
    ["else", exports.ELSE],
    ["return", exports.RETURN],
]);
function lookUpIdent(ident) {
    if (keywords.has(ident))
        return keywords.get(ident);
    else
        return exports.IDENT;
}
exports.lookUpIdent = lookUpIdent;

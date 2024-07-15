export type tokenType = string;
export interface Token {
    type: tokenType;
    literal: string;
}

export const COMMA = ",";
export const SEMICOLON = ";";
export const COLON = ":";
export const QUESTION_MARK = "?";

export const PLUS = "+";
export const MINUS = "-";
export const ASTERISK = "*";
export const SLASH = "/";
export const ASSIGN = "=";
export const GT = "<";
export const LT = ">";

export const BANG = "!";

export const LBRACE = "{";
export const RBRACE = "}";
export const LPAREN = "(";
export const RPAREN = ")";
export const LBRACKET = "[";
export const RBRACKET = "]";

export const IDENT = "IDENT";
export const INT = "INT";
export const STRING = "STRING";

export const EQ = "==";
export const NOT_EQ = "!=";

export const LET = "LET";
export const FUNCTION = "FUNCTION";
export const RETURN = "RETURN";
export const IF = "IF";
export const ELSE = "ELSE";
export const TRUE = "TRUE";
export const FALSE = "FALSE";
export const NULL = "NULL";

export const EOF = "EOF";
export const ILLEGAL = "ILLEGAL";

const keywords = new Map<string, tokenType>([
    ["fn", FUNCTION],
    ["let", LET],
    ["true", TRUE],
    ["false", FALSE],
    ["null", NULL],
    ["if", IF],
    ["else", ELSE],
    ["return", RETURN],
]);

export function lookUpIdent(ident: string): tokenType | undefined {
    if (keywords.has(ident)) return keywords.get(ident);
    else return IDENT;
}

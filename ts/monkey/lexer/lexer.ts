import * as token from "../token/token";

export default class Lexer {
    position = 0;
    readPosition = 0;
    ch = "";
    input: string;
    constructor(input: string) {
        this.input = input;
        this.readChar();
    }
    nextToken(): token.Token {
        this.skipWhitespace();
        let tok: token.Token = { type: "", literal: "" };
        switch (this.ch) {
            case "=":
                if (this.peekChar() === "=") {
                    tok = { type: token.EQ, literal: "==" };
                    this.readChar();
                } else {
                    tok = { type: token.ASSIGN, literal: this.ch };
                }
                break;
            case "+":
                tok = { type: token.PLUS, literal: this.ch };
                break;
            case "-":
                tok = { type: token.MINUS, literal: this.ch };
                break;
            case "*":
                tok = { type: token.ASTERISK, literal: this.ch };
                break;
            case "/":
                tok = { type: token.SLASH, literal: this.ch };
                break;
            case "{":
                tok = { type: token.LBRACE, literal: this.ch };
                break;
            case "}":
                tok = { type: token.RBRACE, literal: this.ch };
                break;
            case "(":
                tok = { type: token.LPAREN, literal: this.ch };
                break;
            case ")":
                tok = { type: token.RPAREN, literal: this.ch };
                break;
            case ";":
                tok = { type: token.SEMICOLON, literal: this.ch };
                break;
            case ",":
                tok = { type: token.COMMA, literal: this.ch };
                break;
            case "!":
                if (this.peekChar() === "=") {
                    tok = { type: token.NOT_EQ, literal: "!=" };
                    this.readChar();
                } else {
                    tok = { type: token.BANG, literal: this.ch };
                }
                break;
            case ">":
                tok = { type: token.GT, literal: this.ch };
                break;
            case "<":
                tok = { type: token.LT, literal: this.ch };
                break;
            case "":
                tok = { type: token.EOF, literal: "" };
                break;

            default:
                if (isLetter(this.ch)) {
                    tok.literal = this.readIdentifier();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    tok.type = token.lookUpIdent(tok.literal)!;
                    return tok;
                } else if (isNumber(this.ch)) {
                    tok.literal = this.readNumber();
                    tok.type = token.INT;
                    return tok;
                } else {
                    tok = { type: token.ILLEGAL, literal: this.ch };
                }
        }
        this.readChar();
        return tok;
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = "";
            return;
        }
        this.ch = this.input[this.readPosition];
        this.position = this.readPosition;
        this.readPosition++;
    }

    private peekChar() {
        if (this.readPosition >= this.input.length) {
            return "";
        } else {
            return this.input[this.readPosition];
        }
    }
    private skipWhitespace(): void {
        while (
            this.ch === " " ||
            this.ch === "\n" ||
            this.ch === "\t" ||
            this.ch === "\r"
        ) {
            this.readChar();
        }
    }
    private readIdentifier(): string {
        const position = this.position;
        while (isLetter(this.ch) || isNumber(this.ch)) {
            this.readChar();
        }

        return this.input.slice(
            position,
            this.position + (this.ch === "" ? 1 : 0),
        );
    }
    private readNumber(): string {
        const position = this.position;
        while (isNumber(this.ch)) {
            this.readChar();
        }
        return this.input.slice(
            position,
            this.position + (this.ch === "" ? 1 : 0),
        );
    }
}
function isLetter(ch: string) {
    return /^[A-Za-z_]$/.test(ch);
}

function isNumber(ch: string) {
    return /[0-9]$/.test(ch);
}

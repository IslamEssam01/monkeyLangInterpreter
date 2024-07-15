/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ast from "../ast/ast";
import type Lexer from "../lexer/lexer";
import * as token from "../token/token";

type prefixParseFn = () => ast.Expression | null;
type infixParseFn = (left: ast.Expression) => ast.Expression | null;
enum Precedence {
    LOWEST = 1,
    TERNARY,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
    INDEX,
}
const precedenceMp = new Map<token.tokenType, number>([
    [token.QUESTION_MARK, Precedence.TERNARY],
    [token.EQ, Precedence.EQUALS],
    [token.NOT_EQ, Precedence.EQUALS],
    [token.LT, Precedence.LESSGREATER],
    [token.GT, Precedence.LESSGREATER],
    [token.PLUS, Precedence.SUM],
    [token.MINUS, Precedence.SUM],
    [token.SLASH, Precedence.PRODUCT],
    [token.ASTERISK, Precedence.PRODUCT],
    [token.LPAREN, Precedence.CALL],
    [token.LBRACKET, Precedence.INDEX],
]);
export class Parser {
    private curToken!: token.Token;
    private peekToken!: token.Token;
    private l: Lexer;
    private prefixParseFns: Map<token.tokenType, prefixParseFn>;
    private infixParseFns: Map<token.tokenType, infixParseFn>;
    errors: string[];

    constructor(l: Lexer) {
        this.l = l;
        this.nextToken();
        this.nextToken();
        this.errors = [];

        this.prefixParseFns = new Map<token.tokenType, prefixParseFn>();
        this.registerPrefixFunction(
            token.IDENT,
            this.parseIdentifier.bind(this),
        );
        this.registerPrefixFunction(
            token.INT,
            this.parseIntegerLiteral.bind(this),
        );
        this.registerPrefixFunction(
            token.BANG,
            this.parsePrefixExpressison.bind(this),
        );
        this.registerPrefixFunction(
            token.MINUS,
            this.parsePrefixExpressison.bind(this),
        );
        this.registerPrefixFunction(
            token.TRUE,
            this.parseBooleanLiteral.bind(this),
        );
        this.registerPrefixFunction(
            token.FALSE,
            this.parseBooleanLiteral.bind(this),
        );
        this.registerPrefixFunction(
            token.LPAREN,
            this.parseGroupedExpression.bind(this),
        );
        this.registerPrefixFunction(
            token.IF,
            this.parseIfExpression.bind(this),
        );
        this.registerPrefixFunction(
            token.FUNCTION,
            this.parseFunctionLiteral.bind(this),
        );
        this.registerPrefixFunction(token.NULL, this.parseNull.bind(this));
        this.registerPrefixFunction(
            token.STRING,
            this.parseStringLiteral.bind(this),
        );
        this.registerPrefixFunction(
            token.LBRACKET,
            this.parseArrayLiteral.bind(this),
        );
        this.registerPrefixFunction(
            token.LBRACE,
            this.parseHashLiteral.bind(this),
        );

        this.infixParseFns = new Map<token.tokenType, infixParseFn>();
        this.registerInfixFunction(
            token.PLUS,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.MINUS,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.ASTERISK,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.SLASH,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.GT,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.LT,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.EQ,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.NOT_EQ,
            this.parseInfixExpression.bind(this),
        );
        this.registerInfixFunction(
            token.LPAREN,
            this.parseCallExpression.bind(this),
        );
        this.registerInfixFunction(
            token.LBRACKET,
            this.parseIndexExpression.bind(this),
        );
        this.registerInfixFunction(
            token.QUESTION_MARK,
            this.parseTernaryExpression.bind(this),
        );
    }

    private nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
    }

    parseProgram() {
        const program = new ast.Program();
        while (!this.curTokenIs(token.EOF)) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        return program;
    }

    private parseStatement() {
        switch (this.curToken.type) {
            case token.LET:
                return this.parseLetStatement();
            case token.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement() {
        const stmt = new ast.LetStatement(this.curToken);
        if (!this.expectPeek(token.IDENT)) {
            return null;
        }
        stmt.name = new ast.Identifier(this.curToken);
        if (!this.expectPeek(token.ASSIGN)) {
            return null;
        }

        this.nextToken();
        stmt.value = this.parseExpression(Precedence.LOWEST)!;
        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    private parseReturnStatement() {
        const stmt = new ast.ReturnStatement(this.curToken);

        this.nextToken();

        stmt.returnValue = this.parseExpression(Precedence.LOWEST)!;
        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    private parseExpressionStatement() {
        const stmt = new ast.ExpressionStatement(this.curToken);
        const exp = this.parseExpression(Precedence.LOWEST);
        if (exp) {
            stmt.expression = exp;

            if (this.peekTokenIs(token.SEMICOLON)) {
                this.nextToken();
            }
            return stmt;
        } else return null;
    }
    private parseBlockStatement() {
        this.nextToken();
        const blockStmt = new ast.BlockStatement(this.curToken);
        while (!this.curTokenIs(token.EOF) && !this.curTokenIs(token.RBRACE)) {
            const stmt = this.parseStatement();
            if (stmt !== null) {
                blockStmt.statements.push(stmt);
            }
            this.nextToken();
        }
        return blockStmt;
    }

    private parseExpression(precedence: number) {
        if (!this.prefixParseFns.has(this.curToken.type)) {
            this.errors.push(
                `no prefix parse function for ${this.curToken.type} found`,
            );
            return null;
        }
        const prefix = this.prefixParseFns.get(this.curToken.type)!;
        let leftExp = prefix();
        while (
            !this.peekTokenIs(token.SEMICOLON) &&
            this.peekPrecedence() > precedence
        ) {
            if (this.infixParseFns.has(this.peekToken.type)) {
                const infix = this.infixParseFns.get(this.peekToken.type)!;
                this.nextToken();
                leftExp = infix(leftExp!);
            } else {
                return leftExp;
            }
        }
        return leftExp;
    }

    private parseIdentifier() {
        const ident = new ast.Identifier(this.curToken);
        return ident;
    }
    private parseIntegerLiteral() {
        const int = new ast.IntegerLiteral(this.curToken);
        return int;
    }

    private parseBooleanLiteral() {
        const bool = new ast.BooleanLiteral(this.curToken);
        return bool;
    }
    private parseNull() {
        const nullLiteral = new ast.NullLiteral(this.curToken);
        return nullLiteral;
    }

    private parseStringLiteral() {
        return new ast.StringLiteral(this.curToken);
    }

    private parseGroupedExpression() {
        this.nextToken();
        const exp = this.parseExpression(Precedence.LOWEST);

        if (!this.expectPeek(token.RPAREN)) {
            return null;
        }

        return exp;
    }

    private parseIfExpression() {
        const ifExp = new ast.IfExpression(this.curToken);
        if (!this.expectPeek(token.LPAREN)) {
            return null;
        }
        const condition = this.parseGroupedExpression();
        if (!condition) return null;
        ifExp.condition = condition;

        if (!this.expectPeek(token.LBRACE)) return null;
        const block = this.parseBlockStatement();
        ifExp.consequence = block;

        if (!this.peekTokenIs(token.ELSE)) {
            ifExp.alternative = null;
            return ifExp;
        }
        this.nextToken();
        if (!this.expectPeek(token.LBRACE)) return null;
        ifExp.alternative = this.parseBlockStatement();
        return ifExp;
    }

    private parseFunctionParameters() {
        const params: ast.Identifier[] = [];
        if (this.peekTokenIs(token.RPAREN)) {
            this.nextToken();
            return params;
        }
        this.nextToken();
        let param = new ast.Identifier(this.curToken);
        params.push(param);
        while (this.peekTokenIs(token.COMMA)) {
            this.nextToken();
            this.nextToken();
            param = new ast.Identifier(this.curToken);
            params.push(param);
        }
        if (!this.expectPeek(token.RPAREN)) return null;
        return params;
    }
    private parseFunctionLiteral() {
        const fnLiteral = new ast.FunctionLiteral(this.curToken);
        if (!this.expectPeek(token.LPAREN)) {
            return null;
        }
        const params = this.parseFunctionParameters();
        if (!Array.isArray(params)) {
            return null;
        }
        fnLiteral.parameters = params;
        if (!this.expectPeek(token.LBRACE)) {
            return null;
        }
        const body = this.parseBlockStatement();
        fnLiteral.body = body;

        return fnLiteral;
    }

    // private parseCallArguments() {
    //     const args: ast.Expression[] = [];
    //     if (this.peekTokenIs(token.RPAREN)) {
    //         this.nextToken();
    //         return args;
    //     }
    //
    //     this.nextToken();
    //     let exp = this.parseExpression(Precedence.LOWEST)!;
    //     args.push(exp);
    //     while (this.peekTokenIs(token.COMMA)) {
    //         this.nextToken();
    //         this.nextToken();
    //         exp = this.parseExpression(Precedence.LOWEST)!;
    //         args.push(exp);
    //     }
    //     if (!this.expectPeek(token.RPAREN)) {
    //         return null;
    //     }
    //     return args;
    // }
    private parseExpressionList(end: token.tokenType) {
        const args: ast.Expression[] = [];

        while (!this.peekTokenIs(end)) {
            this.nextToken();
            const exp = this.parseExpression(Precedence.LOWEST)!;
            args.push(exp);
            if (!this.peekTokenIs(end) && !this.expectPeek(token.COMMA)) {
                return null;
            }
        }
        if (!this.expectPeek(end)) {
            return null;
        }
        return args;
    }
    private parseCallExpression(fn: ast.Expression) {
        const callExp = new ast.CallExpression(this.curToken, fn);
        // callExp.arguments = this.parseCallArguments();
        callExp.arguments = this.parseExpressionList(token.RPAREN);

        return callExp;
    }

    private parseArrayLiteral() {
        const array = new ast.ArrayLiteral(this.curToken);
        array.elements = this.parseExpressionList(token.RBRACKET);
        return array;
    }

    private parseIndexExpression(left: ast.Expression) {
        const tok = this.curToken;
        this.nextToken();
        const index = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(token.RBRACKET)) return null;
        return new ast.IndexExpression(tok, left, index!);
    }
    private parseHashLiteral() {
        const tok = this.curToken;
        const pairs = new Map<ast.Expression | null, ast.Expression | null>();
        while (!this.peekTokenIs(token.RBRACE)) {
            this.nextToken();
            const key = this.parseExpression(Precedence.LOWEST);
            if (!this.expectPeek(token.COLON)) return null;
            this.nextToken();
            const val = this.parseExpression(Precedence.LOWEST);
            pairs.set(key, val);
            if (
                !this.peekTokenIs(token.RBRACE) &&
                !this.expectPeek(token.COMMA)
            ) {
                return null;
            }
        }
        if (!this.expectPeek(token.RBRACE)) return null;
        return new ast.HashLiteral(tok, pairs);
    }

    private parseTernaryExpression(left: ast.Expression) {
        const tok = this.curToken;
        this.nextToken();
        const consequence = this.parseExpression(Precedence.LOWEST);
        if (!consequence) return null;
        if (!this.expectPeek(token.COLON)) return null;
        this.nextToken();
        const alternative = this.parseExpression(Precedence.LOWEST);
        if (!alternative) return null;
        return new ast.Ternary(tok, left, consequence, alternative);
    }

    private parsePrefixExpressison() {
        const prefixExp = new ast.PrefixExpression(this.curToken);
        this.nextToken();

        prefixExp.right = this.parseExpression(Precedence.PREFIX);
        return prefixExp;
    }

    private parseInfixExpression(left: ast.Expression) {
        const infixExpression = new ast.InfixExpression(this.curToken, left);
        const precedence = this.curPrecedence();
        this.nextToken();
        infixExpression.right = this.parseExpression(precedence);

        return infixExpression;
    }

    private expectPeek(type: token.tokenType) {
        if (!this.peekTokenIs(type)) {
            this.errors.push(
                `expected next token to be ${type}, got ${this.peekToken.type} instead`,
            );
            return false;
        }
        this.nextToken();
        return true;
    }
    private curTokenIs(type: token.tokenType) {
        if (this.curToken.type !== type) {
            return false;
        }

        return true;
    }
    private peekTokenIs(type: token.tokenType) {
        if (this.peekToken.type !== type) {
            return false;
        }

        return true;
    }

    private curPrecedence() {
        if (precedenceMp.has(this.curToken.type)) {
            return precedenceMp.get(this.curToken.type)!;
        } else {
            return Precedence.LOWEST;
        }
    }
    private peekPrecedence() {
        if (precedenceMp.has(this.peekToken.type)) {
            return precedenceMp.get(this.peekToken.type)!;
        } else {
            return Precedence.LOWEST;
        }
    }

    private registerPrefixFunction(tok: token.tokenType, fn: prefixParseFn) {
        this.prefixParseFns.set(tok, fn);
    }
    private registerInfixFunction(tok: token.tokenType, fn: infixParseFn) {
        this.infixParseFns.set(tok, fn);
    }
}

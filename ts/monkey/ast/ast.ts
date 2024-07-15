import { TRUE, type Token } from "../token/token";

export abstract class Node {
    abstract tokenLiteral(): string;
    abstract string(): string;
}

export abstract class Statement extends Node {}
export abstract class Expression extends Node {}

export class Program implements Node {
    statements: Statement[];
    constructor() {
        this.statements = [];
    }
    tokenLiteral(): string {
        if (this.statements.length !== 0) {
            return this.statements[0].tokenLiteral();
        } else return "";
    }
    string(): string {
        let out = "";
        this.statements.forEach((statement) => {
            out += statement.string();
        });
        return out;
    }
}
export class LetStatement implements Statement {
    token: Token;
    name?: Identifier;
    value?: Expression;
    constructor(token: Token) {
        this.token = token;
        // this.name = new Identifier(token);
        // this.value  = new Identifier(token)
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `${this.tokenLiteral()} ${this.name?.string()} = ${this.value?.string()};`;
    }
}

export class Identifier implements Expression {
    token: Token;
    value: string;
    constructor(token: Token) {
        this.token = token;
        this.value = token.literal;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.value;
    }
}

export class ReturnStatement implements Statement {
    token: Token;
    returnValue?: Expression;
    constructor(token: Token) {
        this.token = token;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `${this.tokenLiteral()} ${this.returnValue?.string()}`;
    }
}

export class ExpressionStatement implements Statement {
    token: Token;
    expression?: Expression;
    constructor(token: Token) {
        this.token = token;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        if (this.expression) {
            return this.expression.string();
        }
        return "";
    }
}

export class IntegerLiteral implements Expression {
    token: Token;
    value: number;
    constructor(token: Token) {
        this.token = token;
        this.value = Number.parseInt(token.literal);
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    token: Token;
    operator: string;
    right?: Expression | null;
    constructor(token: Token) {
        this.token = token;
        this.operator = token.literal;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `(${this.operator}${this.right?.string()})`;
    }
}

export class InfixExpression implements Expression {
    token: Token;
    operator: string;
    left: Expression;
    right?: Expression | null;
    constructor(token: Token, left: Expression) {
        this.token = token;
        this.operator = token.literal;
        this.left = left;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `(${this.left.string()} ${this.operator} ${this.right?.string()})`;
    }
}

export class BooleanLiteral implements Expression {
    token: Token;
    value: boolean;
    constructor(token: Token) {
        this.token = token;
        this.value = token.type === TRUE ? true : false;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.tokenLiteral();
    }
}

export class BlockStatement implements Statement {
    token: Token;
    statements: Statement[];
    constructor(token: Token) {
        this.token = token;
        this.statements = [];
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        let out = "";
        this.statements?.forEach((stmt) => {
            out += stmt.string();
        });
        return out;
    }
}

export class IfExpression implements Expression {
    token: Token;
    condition?: Expression;
    consequence?: BlockStatement;
    alternative?: BlockStatement | null;
    constructor(token: Token) {
        this.token = token;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        let out = `if ${this.condition?.string()} ${this.consequence?.string()}`;
        if (this.alternative) out += "else " + this.alternative?.string();

        return out;
    }
}

export class FunctionLiteral implements Expression {
    token: Token;
    parameters?: Identifier[];
    body?: BlockStatement;
    constructor(token: Token) {
        this.token = token;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        let out = "fn(";
        const params: string[] = [];
        this.parameters?.forEach((param) => {
            params.push(param.string());
        });
        out += params.join(", ");
        out += ") ";
        out += this.body?.string();
        return out;
    }
}

export class CallExpression implements Expression {
    token: Token;
    fn: Expression;
    arguments?: Expression[] | null;
    constructor(token: Token, fn: Expression) {
        this.token = token;
        this.fn = fn;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        let out = this.fn.string() + "(";
        const args: string[] = [];
        this.arguments?.forEach((arg) => {
            args.push(arg.string());
        });
        out += args.join(", ");
        out += ")";
        return out;
    }
}

export class NullLiteral implements Expression {
    token: Token;
    constructor(token: Token) {
        this.token = token;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.token.literal;
    }
}

export class StringLiteral implements Expression {
    token: Token;
    value: string;
    constructor(token: Token) {
        this.token = token;
        this.value = token.literal;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return this.value;
    }
}

export class ArrayLiteral implements Expression {
    token: Token;
    elements?: Expression[] | null;
    constructor(token: Token) {
        this.token = token;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        const elements = this.elements?.map((elem) => elem.string()) || [];
        return `[${elements.join(", ")}]`;
    }
}

export class IndexExpression implements Expression {
    token: Token;
    left: Expression;
    index: Expression;
    constructor(token: Token, left: Expression, index: Expression) {
        this.token = token;
        this.left = left;
        this.index = index;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        return `(${this.left.string()}[${this.index.string()}])`;
    }
}

export class HashLiteral implements Expression {
    token: Token;
    pairs: Map<Expression | null, Expression | null>;
    constructor(
        token: Token,
        pairs: Map<Expression | null, Expression | null>,
    ) {
        this.token = token;
        this.pairs = pairs;
    }
    tokenLiteral(): string {
        return this.token.literal;
    }
    string(): string {
        const pairs: string[] = [];
        this.pairs.forEach((val, key) => {
            if (key && val) pairs.push(key.string() + ":" + val.string());
        });
        return `{${pairs.join(", ")}}`;
    }
}

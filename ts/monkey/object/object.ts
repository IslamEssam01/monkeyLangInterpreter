import * as ast from "../ast/ast";
import type { Environment } from "./environment";
type ObjectType = string;
export abstract class ObjectInterface {
    abstract type(): ObjectType;
    abstract inspect(): string;
}

type BuiltinFunction = (args: ObjectInterface[]) => ObjectInterface;

export type HashKey = string;

const INTEGER_OBJ = "INTEGER";
const BOOLEAN_OBJ = "BOOLEAN";
const NULL_OBJ = "NULL";
const RETURN_VALUE_OBJ = "RETURN_VALUE";
const ERROR_OBJ = "ERROR";
const FUNCTION_OBJ = "FUNCTION";
const STRING_OBJ = "STRING";
const BUILTIN_OBJ = "BUILTIN";
const ARRAY_OBJ = "ARRAY";
const HASH_OBJ = "HASH";

export abstract class Hashable extends ObjectInterface {
    abstract hashKey(): HashKey;
}

export class Integer extends Hashable {
    value: number;
    constructor(value: number) {
        super();
        this.value = value;
    }
    type() {
        return INTEGER_OBJ;
    }

    inspect(): string {
        return `${this.value}`;
    }
    hashKey(): HashKey {
        return `integer-${this.value}`;
    }
}

export class Boolean extends Hashable {
    value: boolean;
    constructor(value: boolean) {
        super();
        this.value = value;
    }
    type(): ObjectType {
        return BOOLEAN_OBJ;
    }
    inspect(): string {
        return `${this.value}`;
    }
    hashKey(): HashKey {
        if (this.value) return "boolean-true";
        return "boolean-false";
    }
}

export class Null extends ObjectInterface {
    type(): ObjectType {
        return NULL_OBJ;
    }
    inspect(): string {
        return "null";
    }
}

export class ReturnValue extends ObjectInterface {
    value: ObjectInterface;
    constructor(value: ObjectInterface) {
        super();
        this.value = value;
    }
    type(): ObjectType {
        return RETURN_VALUE_OBJ;
    }

    inspect(): string {
        return `${this.value}`;
    }
}

export class Error extends ObjectInterface {
    message: string;
    constructor(message: string) {
        super();
        this.message = message;
    }
    type(): ObjectType {
        return ERROR_OBJ;
    }
    inspect(): string {
        return "ERROR: " + this.message;
    }
}

export class Function extends ObjectInterface {
    parameters: ast.Identifier[];
    body: ast.BlockStatement;
    env: Environment;
    constructor(
        parameters: ast.Identifier[],
        body: ast.BlockStatement,
        env: Environment,
    ) {
        super();
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }
    type(): ObjectType {
        return FUNCTION_OBJ;
    }
    inspect(): string {
        let out = "fn(";
        const params: string[] = [];
        this.parameters.forEach((param) => {
            params.push(param.string());
        });
        out += params.join(", ");
        out += ") " + "{\n";
        out += this.body.string();
        out += "\n}";
        return out;
    }
}

export class String extends Hashable {
    value: string;
    constructor(value: string) {
        super();
        this.value = value;
    }
    type(): ObjectType {
        return STRING_OBJ;
    }
    inspect(): string {
        return this.value;
    }
    hashKey(): HashKey {
        return this.value;
    }
}

export class Builtin extends ObjectInterface {
    fn: BuiltinFunction;
    constructor(fn: BuiltinFunction) {
        super();
        this.fn = fn;
    }
    type(): ObjectType {
        return BUILTIN_OBJ;
    }
    inspect(): string {
        return "builtin function";
    }
}

export class Array extends ObjectInterface {
    elements: ObjectInterface[];
    constructor(elements: ObjectInterface[]) {
        super();
        this.elements = elements;
    }
    type(): ObjectType {
        return ARRAY_OBJ;
    }
    inspect(): string {
        const elements = this.elements.map((elem) => elem.inspect());
        return `[${elements.join(", ")}]`;
    }
}

export class HashPair {
    key: ObjectInterface;
    value: ObjectInterface;
    constructor(key: ObjectInterface, value: ObjectInterface) {
        this.key = key;
        this.value = value;
    }
}

export class Hash extends ObjectInterface {
    pairs: Map<HashKey, HashPair>;
    constructor(pairs: Map<HashKey, HashPair>) {
        super();
        this.pairs = pairs;
    }
    type(): ObjectType {
        return HASH_OBJ;
    }
    inspect(): string {
        const pairs: string[] = [];
        this.pairs.forEach((pair) => {
            pairs.push(`${pair.key.inspect()}: ${pair.value.inspect()}`);
        });

        return `{${pairs.join(", ")}}`;
    }
}

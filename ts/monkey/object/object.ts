import * as ast from "../ast/ast";
import type { Environment } from "./environment";
type ObjectType = string;
export interface ObjectInterface {
    type(): ObjectType;
    inspect(): string;
}

type BuiltinFunction = (args: ObjectInterface[]) => ObjectInterface;

const INTEGER_OBJ = "INTEGER";
const BOOLEAN_OBJ = "BOOLEAN";
const NULL_OBJ = "NULL";
const RETURN_VALUE_OBJ = "RETURN_VALUE";
const ERROR_OBJ = "ERROR";
const FUNCTION_OBJ = "FUNCTION";
const STRING_OBJ = "STRING";
const BUILTIN_OBJ = "BUILTIN";
const ARRAY_OBJ = "ARRAY";

export class Integer implements ObjectInterface {
    value: number;
    constructor(value: number) {
        this.value = value;
    }
    type() {
        return INTEGER_OBJ;
    }

    inspect(): string {
        return `${this.value}`;
    }
}

export class Boolean implements ObjectInterface {
    value: boolean;
    constructor(value: boolean) {
        this.value = value;
    }
    type(): ObjectType {
        return BOOLEAN_OBJ;
    }
    inspect(): string {
        return `${this.value}`;
    }
}

export class Null implements ObjectInterface {
    type(): ObjectType {
        return NULL_OBJ;
    }
    inspect(): string {
        return "null";
    }
}

export class ReturnValue implements ObjectInterface {
    value: ObjectInterface;
    constructor(value: ObjectInterface) {
        this.value = value;
    }
    type(): ObjectType {
        return RETURN_VALUE_OBJ;
    }

    inspect(): string {
        return `${this.value}`;
    }
}

export class Error implements ObjectInterface {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
    type(): ObjectType {
        return ERROR_OBJ;
    }
    inspect(): string {
        return "ERROR: " + this.message;
    }
}

export class Function implements ObjectInterface {
    parameters: ast.Identifier[];
    body: ast.BlockStatement;
    env: Environment;
    constructor(
        parameters: ast.Identifier[],
        body: ast.BlockStatement,
        env: Environment,
    ) {
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

export class String implements ObjectInterface {
    value: string;
    constructor(value: string) {
        this.value = value;
    }
    type(): ObjectType {
        return STRING_OBJ;
    }
    inspect(): string {
        return this.value;
    }
}

export class Builtin implements ObjectInterface {
    fn: BuiltinFunction;
    constructor(fn: BuiltinFunction) {
        this.fn = fn;
    }
    type(): ObjectType {
        return BUILTIN_OBJ;
    }
    inspect(): string {
        return "builtin function";
    }
}

export class Array implements ObjectInterface {
    elements: ObjectInterface[];
    constructor(elements: ObjectInterface[]) {
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

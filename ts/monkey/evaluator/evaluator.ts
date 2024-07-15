/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as ast from "../ast/ast";
import { Environment } from "../object/environment";
import * as object from "../object/object";
import { builtins } from "./builtins";

export const NULL = new object.Null();
const TRUE = new object.Boolean(true);
const FALSE = new object.Boolean(false);

export function evaluate(
    node: ast.Node,
    env: Environment,
): object.ObjectInterface {
    if (node instanceof ast.IntegerLiteral) {
        return new object.Integer(node.value);
    }

    if (node instanceof ast.BooleanLiteral) {
        return nativeBoolToBooleanObject(node.value);
    }

    if (node instanceof ast.NullLiteral) {
        return NULL;
    }

    if (node instanceof ast.PrefixExpression) {
        const right = evaluate(node.right!, env);
        if (isError(right)) return right;
        return evalPrefixExpression(node.operator, right);
    }

    if (node instanceof ast.InfixExpression) {
        const left = evaluate(node.left!, env);
        if (isError(left)) return left;
        const right = evaluate(node.right!, env);
        if (isError(right)) return right;
        return evalInfixExpression(node.operator, left, right);
    }

    if (node instanceof ast.BlockStatement) {
        return evalBlockStatement(node.statements, env);
    }

    if (node instanceof ast.IfExpression) {
        return evalIfExpression(node, env);
    }

    if (node instanceof ast.Identifier) {
        return evalIdentifier(node, env);
    }

    if (node instanceof ast.FunctionLiteral) {
        return new object.Function(node.parameters!, node.body!, env);
    }

    if (node instanceof ast.CallExpression) {
        const func = evaluate(node.fn, env);
        if (isError(func)) return func;
        const args = evalExpressions(node.arguments!, env);
        if (args.length === 1 && isError(args[0])) {
            return args[0];
        }

        return applyFunction(func, args);
    }

    if (node instanceof ast.StringLiteral) {
        return new object.String(node.value);
    }

    if (node instanceof ast.ArrayLiteral) {
        const elements = evalExpressions(node.elements!, env);
        if (elements.length === 1 && isError(elements[0])) {
            return elements[0];
        }
        return new object.Array(elements);
    }

    if (node instanceof ast.IndexExpression) {
        const arr = evaluate(node.left, env);
        if (isError(arr)) return arr;
        const index = evaluate(node.index, env);
        if (isError(index)) return index;
        return evalIndexExpression(arr, index);
    }
    if (node instanceof ast.HashLiteral) {
        return evalHashLiteral(node, env);
    }

    if (node instanceof ast.ReturnStatement) {
        const val = evaluate(node.returnValue!, env);
        if (isError(val)) return val;
        return new object.ReturnValue(val);
    }

    if (node instanceof ast.LetStatement) {
        if (builtins.get(node.name!.value)) {
            return newError(
                `can't assign to ${node.name!.value} , it is a builtin function`,
            );
        }
        const val = evaluate(node.value!, env);
        if (isError(val)) return val;
        env.set(node.name!.value, val);
    }

    if (node instanceof ast.ExpressionStatement) {
        return evaluate(node.expression!, env);
    }

    if (node instanceof ast.Program) {
        return evalProgram(node.statements, env);
    }

    return NULL;
}

function evalProgram(
    stmts: ast.Statement[],
    env: Environment,
): object.ObjectInterface {
    let result: object.ObjectInterface = NULL;
    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i], env);
        if (result instanceof object.Error) {
            return result;
        }
        if (result instanceof object.ReturnValue) {
            return result.value;
        }
    }

    return result;
}

function evalBlockStatement(
    stmts: ast.Statement[],
    env: Environment,
): object.ObjectInterface {
    let result: object.ObjectInterface = NULL;
    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i], env);
        if (result instanceof object.Error) {
            return result;
        }
        if (result instanceof object.ReturnValue) {
            return result;
        }
    }

    return result;
}

function evalExpressions(expressions: ast.Expression[], env: Environment) {
    const result: object.ObjectInterface[] = [];
    for (let i = 0; i < expressions.length; i++) {
        const evaluated = evaluate(expressions[i], env);

        if (isError(evaluated)) {
            return [evaluated];
        }
        result.push(evaluated);
    }
    return result;
}
function evalPrefixExpression(operator: string, right: object.ObjectInterface) {
    switch (operator) {
        case "!":
            return evalBangOperatorExpression(right);
        case "-":
            return evalMinusPrefixOperatorExpression(right);

        default:
            return newError(`unknown operator: ${operator}${right.type()}`);
    }
}

function evalBangOperatorExpression(right: object.ObjectInterface) {
    return nativeBoolToBooleanObject(!isTruthy(right));
}

function evalMinusPrefixOperatorExpression(right: object.ObjectInterface) {
    if (right instanceof object.Integer)
        return new object.Integer(-right.value);
    return newError(`unknown operator: -${right.type()}`);
}

function evalInfixExpression(
    operator: string,
    left: object.ObjectInterface,
    right: object.ObjectInterface,
): object.ObjectInterface {
    if (left instanceof object.String && right instanceof object.String) {
        return evalStringInfixExpression(operator, left, right);
    }
    if (left instanceof object.Integer && right instanceof object.Integer) {
        return evalIntegerInfixExpression(operator, left, right);
    }
    if (operator === "==") {
        return nativeBoolToBooleanObject(left === right);
    }
    if (operator === "!=") {
        return nativeBoolToBooleanObject(left !== right);
    }
    if (left.type() !== right.type()) {
        return newError(
            `type mismatch: ${left.type()} ${operator} ${right.type()}`,
        );
    }

    return newError(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`,
    );
}

function evalIntegerInfixExpression(
    operator: string,
    left: object.Integer,
    right: object.Integer,
) {
    const leftVal = left.value;
    const rightVal = right.value;
    switch (operator) {
        case "+":
            return new object.Integer(leftVal + rightVal);
        case "-":
            return new object.Integer(leftVal - rightVal);
        case "*":
            return new object.Integer(leftVal * rightVal);
        case "/":
            return new object.Integer(leftVal / rightVal);
        case ">":
            return nativeBoolToBooleanObject(leftVal > rightVal);
        case "<":
            return nativeBoolToBooleanObject(leftVal < rightVal);
        case "==":
            return nativeBoolToBooleanObject(leftVal === rightVal);
        case "!=":
            return nativeBoolToBooleanObject(leftVal !== rightVal);
        default:
            return newError(
                `unknown operator: ${left.type()} ${operator} ${right.type()}`,
            );
    }
}

function evalStringInfixExpression(
    operator: string,
    left: object.String,
    right: object.String,
) {
    const leftVal = left.value;
    const rightVal = right.value;

    switch (operator) {
        case "+":
            return new object.String(leftVal + rightVal);
        case "==":
            return nativeBoolToBooleanObject(leftVal == rightVal);
        case "!=":
            return nativeBoolToBooleanObject(leftVal != rightVal);

        default:
            return newError(
                `unknown operator: ${left.type()} ${operator} ${right.type()}`,
            );
    }
}

function evalIfExpression(ie: ast.IfExpression, env: Environment) {
    const condition = evaluate(ie.condition!, env);
    if (isError(condition)) {
        return condition;
    }
    if (isTruthy(condition)) {
        return evaluate(ie.consequence!, env);
    }
    if (ie.alternative) {
        return evaluate(ie.alternative, env);
    }
    return NULL;
}

function evalIdentifier(ident: ast.Identifier, env: Environment) {
    const val = env.get(ident.value);
    if (val) return val;
    const builtin = builtins.get(ident.value);
    if (!builtin) return newError(`identifier not found: ${ident.value}`);
    return builtin;
}

function evalIndexExpression(
    left: object.ObjectInterface,
    index: object.ObjectInterface,
) {
    if (left instanceof object.Array && index instanceof object.Integer)
        return evalArrayIndexExpression(left, index);
    if (left instanceof object.Hash)
        return evalHashIndexExpression(left, index);
    return newError(`index operator not supported: ${left.type()}`);
}

function evalArrayIndexExpression(left: object.Array, index: object.Integer) {
    if (index.value < 0) {
        return newError("array index can't be negative");
    }
    if (index.value >= left.elements.length) {
        return newError(
            `array index out of range , maxIndex=${left.elements.length - 1}`,
        );
    }
    return left.elements[index.value];
}

function evalHashLiteral(node: ast.HashLiteral, env: Environment) {
    const pairs = new Map<string, object.HashPair>();
    for (const [keyNode, valNode] of node.pairs) {
        const key = evaluate(keyNode!, env);
        if (isError(key)) {
            return key;
        }
        if (!(key instanceof object.Hashable)) {
            return newError(`unusable as hash key: ${key.type()}`);
        }
        const val = evaluate(valNode!, env);
        if (isError(val)) return val;

        pairs.set(key.hashKey(), new object.HashPair(key, val));
    }
    return new object.Hash(pairs);
}
function evalHashIndexExpression(
    left: object.Hash,
    index: object.ObjectInterface,
) {
    if (!(index instanceof object.Hashable)) {
        return newError(`unusable as hash key: ${index.type()}`);
    }
    const val = left.pairs.get(index.hashKey());
    if (val) return val.value;
    return NULL;
}

function applyFunction(
    func: object.ObjectInterface,
    args: object.ObjectInterface[],
) {
    if (func instanceof object.Function) {
        if (args.length > func.parameters.length)
            return newError(
                `Too many arguments, expected ${func.parameters.length}, got ${args.length}`,
            );
        if (args.length < func.parameters.length)
            return newError(
                `Too few arguments, expected ${func.parameters.length}, got ${args.length}`,
            );
        const evaluated = evaluate(
            func.body,
            extendFunctionEnv(func.parameters, args, func.env),
        );
        if (evaluated instanceof object.ReturnValue) {
            return evaluated.value;
        }
        return evaluated;
    }
    if (func instanceof object.Builtin) {
        return func.fn(args);
    }
    return newError(`not a function: ${func.type()}`);
}

function extendFunctionEnv(
    params: ast.Identifier[],
    args: object.ObjectInterface[],
    env: Environment,
) {
    const extendedEnv = new Environment(env);
    params.forEach((param, i) => {
        extendedEnv.set(param.value, args[i]);
    });
    return extendedEnv;
}
function nativeBoolToBooleanObject(input: boolean) {
    if (input) return TRUE;
    return FALSE;
}

function isTruthy(obj: object.ObjectInterface) {
    switch (obj) {
        case FALSE:
            return false;
        case NULL:
            return false;

        default:
            return true;
    }
}

export function newError(message: string) {
    return new object.Error(message);
}

function isError(obj: object.ObjectInterface) {
    return obj instanceof object.Error;
}

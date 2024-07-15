import * as object from "../object/object";
import { newError, NULL } from "./evaluator";
export const builtins = new Map<string, object.Builtin>([
    [
        "len",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 1);
            if (error) return error;
            const arg = args[0];
            if (arg instanceof object.String)
                return new object.Integer(arg.value.length);
            if (arg instanceof object.Array)
                return new object.Integer(arg.elements.length);
            return newError(
                `argument to \`len\` not supported, got ${arg.type()}`,
            );
        }),
    ],
    [
        "first",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 1);
            if (error) return error;
            const arg = args[0];
            if (!(arg instanceof object.Array))
                return newError(
                    `argument to \`first\` must be ARRAY, got ${arg.type()}`,
                );
            if (arg.elements.length === 0)
                return newError("Array have 0 elements , can't return `first`");

            return arg.elements[0];
        }),
    ],
    [
        "last",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 1);
            if (error) return error;
            const arg = args[0];
            if (!(arg instanceof object.Array))
                return newError(
                    `argument to \`last\` must be ARRAY, got ${arg.type()}`,
                );
            if (arg.elements.length === 0)
                return newError("Array have 0 elements , can't return `last`");

            return arg.elements.slice(-1)[0];
        }),
    ],
    [
        "rest",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 1);
            if (error) return error;
            const arg = args[0];
            if (!(arg instanceof object.Array))
                return newError(
                    `argument to \`rest\` must be ARRAY, got ${arg.type()}`,
                );

            if (arg.elements.length === 0)
                return newError("Array have 0 elements , can't return `rest`");

            return new object.Array(arg.elements.slice(1));
        }),
    ],
    [
        "push",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 2);
            if (error) return error;
            const arr = args[0];
            const elem = args[1];
            if (!(arr instanceof object.Array))
                return newError(
                    `first argument to \`push\` must be ARRAY, got ${arr.type()}`,
                );

            return new object.Array(arr.elements.concat(elem));
        }),
    ],
    [
        "puts",
        new object.Builtin((args: object.ObjectInterface[]) => {
            args.forEach((arg) => {
                console.log(arg.inspect());
            });
            return NULL;
        }),
    ],
    [
        "set",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 3);
            if (error) return error;
            const hash = args[0];
            const key = args[1];
            const val = args[2];
            if (!(hash instanceof object.Hash)) {
                return newError(
                    `argument to \`set\` must be HASH, got ${hash.type()}`,
                );
            }

            if (!(key instanceof object.Hashable)) {
                return newError(`unusable as hash key: ${key.type()}`);
            }
            hash.pairs.set(key.hashKey(), new object.HashPair(key, val));
            return NULL;
        }),
    ],
]);

function argumentsError(args: object.ObjectInterface[], length: number) {
    if (length > args.length) {
        return newError(
            `Too few arguments, expected ${length}, got ${args.length}`,
        );
    }
    if (length < args.length) {
        return newError(
            `Too many arguments, expected ${length}, got ${args.length}`,
        );
    }

    return null;
}

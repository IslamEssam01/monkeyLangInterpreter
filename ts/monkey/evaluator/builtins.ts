import * as object from "../object/object";
import { newError, NULL } from "./evaluator";
export const builtins = new Map<string, object.Builtin>([
    [
        "len",
        new object.Builtin((args: object.ObjectInterface[]) => {
            const error = argumentsError(args, 1);
            if (error) return error;
            const arg = args[0];
            if (!(arg instanceof object.String))
                return newError(
                    `argument to \`len\` not supported, got ${arg.type()}`,
                );
            return new object.Integer(arg.value.length);
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

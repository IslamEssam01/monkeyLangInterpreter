import os from "os";
import Lexer from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { evaluate } from "../evaluator/evaluator";
import { Environment } from "../object/environment";

export async function start() {
    const user = os.userInfo().username;
    const env = new Environment();

    console.log(`Hello ${user} this is the Monkey Programming Language`);
    console.log("Feel free to type commands");

    const prompt = ">> ";
    process.stdout.write(prompt);
    for await (const line of console) {
        const l = new Lexer(line);
        const p = new Parser(l);
        const program = p.parseProgram();
        if (p.errors.length > 0) {
            console.log("Woops! We ran into some monkey business here!");
            console.log("parse errors:");
            p.errors.forEach((error) => {
                console.log("\t", error);
            });
            process.stdout.write(prompt);
            continue;
        }
        const evaluated = evaluate(program, env);
        if (evaluated) console.log(evaluated.inspect());
        process.stdout.write(prompt);
    }
}

import os from "os";
import Lexer from "../lexer/lexer";
import { EOF } from "../token/token";
import { Parser } from "../parser/parser";

export async function start() {
    const user = os.userInfo().username;

    console.log(`Hello ${user} this is the Monkey Programming Language`);
    console.log("Feel free to type commands");

    const prompt = ">>";
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
        console.log(program.string());
        process.stdout.write(prompt);
    }
}

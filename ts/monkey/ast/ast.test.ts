import { IDENT, LET } from "../token/token";
import { Identifier, LetStatement, Program } from "./ast";
import { expect, test } from "vitest";

test("testString", () => {
    const program = new Program();
    const letStmt = new LetStatement({ type: LET, literal: "let" });
    letStmt.name = new Identifier({ type: IDENT, literal: "myVar" });
    letStmt.value = new Identifier({ type: IDENT, literal: "anotherVar" });
    program.statements = [letStmt];
    expect(program.string()).toBe("let myVar = anotherVar;");
});

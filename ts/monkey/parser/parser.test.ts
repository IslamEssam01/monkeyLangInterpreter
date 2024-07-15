/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect, test } from "vitest";
import * as ast from "../ast/ast";
import Lexer from "../lexer/lexer";
import { Parser } from "./parser";

test("Test Let Statements", () => {
    const tests = [
        { input: "let x = 5;", expectedIdentifier: "x", expectedValue: 5 },
        {
            input: "let y = true;",
            expectedIdentifier: "y",
            expectedValue: true,
        },
        {
            input: "let foobar = y;",
            expectedIdentifier: "foobar",
            expectedValue: "y",
        },
    ];

    tests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);

        const stmt = program.statements[0];
        testLetStatement(stmt, test.expectedIdentifier);

        const val = (stmt as ast.LetStatement).value;
        testLiteralExpression(val!, test.expectedValue);
    });
});
test("Test Return Statements", () => {
    const tests = [
        { input: "return 5;", expectedValue: 5 },
        { input: "return true;", expectedValue: true },
        { input: "return foobar;", expectedValue: "foobar" },
    ];
    tests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ast.ReturnStatement);
        expect(stmt.tokenLiteral()).toBe("return");
        testLiteralExpression(
            (stmt as ast.ReturnStatement).returnValue!,
            test.expectedValue,
        );
    });
});

test("Test Identifier Expression", () => {
    const input = "foobar;";
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    if (stmt instanceof ast.ExpressionStatement) {
        const ident = stmt.expression;
        expect(ident).toBeInstanceOf(ast.Identifier);
        expect((ident as ast.Identifier).value).toBe("foobar");
        expect((ident as ast.Identifier).tokenLiteral()).toBe("foobar");
    }
});
test("Test Integer Literal Expression", () => {
    const input = "5;";
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    if (stmt instanceof ast.ExpressionStatement) {
        const int = stmt.expression;
        expect(int).toBeInstanceOf(ast.IntegerLiteral);
        expect((int as ast.IntegerLiteral).value).toBe(5);
        expect((int as ast.IntegerLiteral).tokenLiteral()).toBe("5");
    }
});
test("Test Boolean Literal Expression", () => {
    const tests: { input: string; expectedBoolean: boolean }[] = [
        { input: "true;", expectedBoolean: true },
        { input: "false;", expectedBoolean: false },
    ];
    tests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
        if (stmt instanceof ast.ExpressionStatement) {
            const int = stmt.expression;
            expect(int).toBeInstanceOf(ast.BooleanLiteral);
            expect((int as ast.BooleanLiteral).value).toBe(
                test.expectedBoolean,
            );
            expect((int as ast.BooleanLiteral).tokenLiteral()).toBe(
                `${test.expectedBoolean}`,
            );
        }
    });
});

test("Test Prefix Expression", () => {
    const prefixTests: { input: string; operator: string; value: unknown }[] = [
        { input: "!5;", operator: "!", value: 5 },
        { input: "-15;", operator: "-", value: 15 },
        { input: "!foobar;", operator: "!", value: "foobar" },
        { input: "-foobar;", operator: "-", value: "foobar" },
        { input: "!true;", operator: "!", value: true },
        { input: "!false;", operator: "!", value: false },
    ];

    prefixTests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
        if (stmt instanceof ast.ExpressionStatement) {
            const exp = stmt.expression;
            expect(exp).toBeInstanceOf(ast.PrefixExpression);
            const preExp = exp as ast.PrefixExpression;
            expect(preExp.operator).toBe(test.operator);
            if (preExp.right) {
                testLiteralExpression(preExp.right, test.value);
            }
        }
    });
});

test("Test Infix Expression", () => {
    const infixTests: {
        input: string;
        leftValue: unknown;
        operator: string;
        rightValue: unknown;
    }[] = [
        { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
        { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
        { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
        { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
        { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
        { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
        { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
        { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
        {
            input: "foobar + barfoo;",
            leftValue: "foobar",
            operator: "+",
            rightValue: "barfoo",
        },
        {
            input: "foobar - barfoo;",
            leftValue: "foobar",
            operator: "-",
            rightValue: "barfoo",
        },
        {
            input: "foobar * barfoo;",
            leftValue: "foobar",
            operator: "*",
            rightValue: "barfoo",
        },
        {
            input: "foobar / barfoo;",
            leftValue: "foobar",
            operator: "/",
            rightValue: "barfoo",
        },
        {
            input: "foobar > barfoo;",
            leftValue: "foobar",
            operator: ">",
            rightValue: "barfoo",
        },
        {
            input: "foobar < barfoo;",
            leftValue: "foobar",
            operator: "<",
            rightValue: "barfoo",
        },
        {
            input: "foobar == barfoo;",
            leftValue: "foobar",
            operator: "==",
            rightValue: "barfoo",
        },
        {
            input: "foobar != barfoo;",
            leftValue: "foobar",
            operator: "!=",
            rightValue: "barfoo",
        },
        {
            input: "true == true",
            leftValue: true,
            operator: "==",
            rightValue: true,
        },
        {
            input: "true != false",
            leftValue: true,
            operator: "!=",
            rightValue: false,
        },
        {
            input: "false == false",
            leftValue: false,
            operator: "==",
            rightValue: false,
        },
    ];

    infixTests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);
        expect(program.statements.length).toBe(1);
        const stmt = program.statements[0];
        expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
        const expStmt = stmt as ast.ExpressionStatement;
        if (expStmt.expression) {
            testInfixExpression(
                expStmt.expression,
                test.leftValue,
                test.operator,
                test.rightValue,
            );
        }
    });
});

test("Test Precedence", () => {
    const tests: { input: string; expected: string }[] = [
        {
            input: "-a * b",
            expected: "((-a) * b)",
        },
        {
            input: "!-a",
            expected: "(!(-a))",
        },
        {
            input: "a + b + c",
            expected: "((a + b) + c)",
        },
        {
            input: "a + b - c",
            expected: "((a + b) - c)",
        },
        {
            input: "a * b * c",
            expected: "((a * b) * c)",
        },
        {
            input: "a * b / c",
            expected: "((a * b) / c)",
        },
        {
            input: "a + b / c",
            expected: "(a + (b / c))",
        },
        {
            input: "a + b * c + d / e - f",
            expected: "(((a + (b * c)) + (d / e)) - f)",
        },
        {
            input: "3 + 4; -5 * 5",
            expected: "(3 + 4)((-5) * 5)",
        },
        {
            input: "5 > 4 == 3 < 4",
            expected: "((5 > 4) == (3 < 4))",
        },
        {
            input: "5 < 4 != 3 > 4",
            expected: "((5 < 4) != (3 > 4))",
        },
        {
            input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
            expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        },
        {
            input: "true",
            expected: "true",
        },
        {
            input: "false",
            expected: "false",
        },
        {
            input: "3 > 5 == false",
            expected: "((3 > 5) == false)",
        },
        {
            input: "3 < 5 == true",
            expected: "((3 < 5) == true)",
        },
        {
            input: "1 + (2 + 3) + 4",
            expected: "((1 + (2 + 3)) + 4)",
        },
        {
            input: "(5 + 5) * 2",
            expected: "((5 + 5) * 2)",
        },
        {
            input: "2 / (5 + 5)",
            expected: "(2 / (5 + 5))",
        },
        {
            input: "(5 + 5) * 2 * (5 + 5)",
            expected: "(((5 + 5) * 2) * (5 + 5))",
        },
        {
            input: "-(5 + 5)",
            expected: "(-(5 + 5))",
        },
        {
            input: "!(true == true)",
            expected: "(!(true == true))",
        },
        {
            input: "a + add(b * c) + d",
            expected: "((a + add((b * c))) + d)",
        },
        {
            input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
            expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
        },
        {
            input: "add(a + b + c * d / f + g)",
            expected: "add((((a + b) + ((c * d) / f)) + g))",
        },
        {
            input: "a * [1, 2, 3, 4][b * c] * d",
            expected: "((a * ([1, 2, 3, 4][(b * c)])) * d)",
        },
        {
            input: "add(a * b[2], b[1], 2 * [1, 2][1])",
            expected: "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
        },
    ];
    tests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        expect(program.string()).toBe(test.expected);
    });
});
test("Test If Expression", () => {
    const input = `if (x < y) { x }`;

    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    const exp = (stmt as ast.ExpressionStatement).expression;
    expect(exp).toBeInstanceOf(ast.IfExpression);
    const ifExp = exp as ast.IfExpression;

    if (ifExp.condition) {
        testInfixExpression(ifExp.condition, "x", "<", "y");
    }
    if (ifExp.consequence && ifExp.consequence.statements) {
        expect(ifExp.consequence.statements.length).toBe(1);
        const consequence = ifExp.consequence.statements[0];
        expect(consequence).toBeInstanceOf(ast.ExpressionStatement);
        const expConsequence = consequence as ast.ExpressionStatement;
        if (expConsequence.expression) {
            testIdentifier(expConsequence.expression, "x");
        }
        expect(ifExp.alternative).toBeNull();
    }
});

test("Test If Else Expression", () => {
    const input = `if (x < y) { x } else { y }`;

    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    const exp = (stmt as ast.ExpressionStatement).expression;
    expect(exp).toBeInstanceOf(ast.IfExpression);
    const ifExp = exp as ast.IfExpression;

    if (ifExp.condition) {
        testInfixExpression(ifExp.condition, "x", "<", "y");
    }
    if (ifExp.consequence && ifExp.consequence.statements) {
        expect(ifExp.consequence.statements.length).toBe(1);
        const consequence = ifExp.consequence.statements[0];
        expect(consequence).toBeInstanceOf(ast.ExpressionStatement);
        const expConsequence = consequence as ast.ExpressionStatement;
        if (expConsequence.expression) {
            testIdentifier(expConsequence.expression, "x");
        }
        expect(ifExp.alternative?.statements.length).toBe(1);
        if (ifExp.alternative) {
            const alternative = ifExp.alternative.statements[0];
            expect(alternative).toBeInstanceOf(ast.ExpressionStatement);
            testIdentifier(
                (alternative as ast.ExpressionStatement).expression!,
                "y",
            );
        }
    }
});

test("Test Function Literal Parsing", () => {
    const input = `fn(x, y) { x + y; }`;

    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    const exp = (stmt as ast.ExpressionStatement).expression;
    expect(exp).toBeInstanceOf(ast.FunctionLiteral);

    const functionLiteral = exp as ast.FunctionLiteral;

    if (functionLiteral.parameters) {
        expect(functionLiteral.parameters.length).toBe(2);
        testLiteralExpression(functionLiteral.parameters[0], "x");
        testLiteralExpression(functionLiteral.parameters[1], "y");
    }

    if (functionLiteral.body) {
        expect(functionLiteral.body.statements.length).toBe(1);
        const bodyStmt = functionLiteral.body.statements[0];
        expect(bodyStmt).toBeInstanceOf(ast.ExpressionStatement);
        testInfixExpression(
            (bodyStmt as ast.ExpressionStatement).expression!,
            "x",
            "+",
            "y",
        );
    }
});

test("Function Parameter Parsing", () => {
    const tests = [
        { input: "fn() {};", expectedParams: [] },
        { input: "fn(x) {};", expectedParams: ["x"] },
        { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
    ];

    tests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        const stmt = program.statements[0] as ast.ExpressionStatement;
        const functionLiteral = stmt.expression as ast.FunctionLiteral;

        expect(functionLiteral.parameters!.length).toBe(
            test.expectedParams.length,
        );

        test.expectedParams.forEach((ident, i) => {
            testLiteralExpression(functionLiteral.parameters![i], ident);
        });
    });
});

test("Test Call Expression Parsing", () => {
    const input = "add(1, 2 * 3, 4 + 5);";

    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ast.ExpressionStatement);
    const exp = (stmt as ast.ExpressionStatement).expression;
    expect(exp).toBeInstanceOf(ast.CallExpression);
    const callExp = exp as ast.CallExpression;

    testIdentifier(callExp.fn, "add");

    if (callExp.arguments) {
        expect(callExp.arguments.length).toBe(3);

        testLiteralExpression(callExp.arguments[0], 1);
        testInfixExpression(callExp.arguments[1], 2, "*", 3);
        testInfixExpression(callExp.arguments[2], 4, "+", 5);
    }
});

test("Test Call Expression Parameter Parsing", () => {
    const tests = [
        { input: "add();", expectedIdent: "add", expectedArgs: [] },
        { input: "add(1);", expectedIdent: "add", expectedArgs: ["1"] },
        {
            input: "add(1, 2 * 3, 4 + 5);",
            expectedIdent: "add",
            expectedArgs: ["1", "(2 * 3)", "(4 + 5)"],
        },
    ];

    tests.forEach((test) => {
        const l = new Lexer(test.input);
        const p = new Parser(l);
        const program = p.parseProgram();
        checkParserErrors(p);

        const stmt = program.statements[0];
        const exp = (stmt as ast.ExpressionStatement)
            .expression as ast.CallExpression;

        testIdentifier(exp.fn, test.expectedIdent);

        if (exp.arguments) {
            expect(exp.arguments.length).toBe(test.expectedArgs.length);

            exp.arguments.forEach((arg, i) => {
                expect(arg.string()).toBe(test.expectedArgs[i]);
            });
        }
    });
});
test("Test String Literal Expression", () => {
    const input = `"hello world"`;
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const literal = stmt.expression;
    expect(literal).toBeInstanceOf(ast.StringLiteral);
    expect((literal as ast.StringLiteral).value).toBe("hello world");
});

test("Test Parsing Empty Array Literals", () => {
    const input = `[]`;
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const array = stmt.expression;
    expect(array).toBeInstanceOf(ast.ArrayLiteral);
    expect((array as ast.ArrayLiteral).elements?.length).toBe(0);
});

test("Test Parsing Array Literals", () => {
    const input = `[1, 2 * 2, 3 + 3]`;
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const array = stmt.expression;
    expect(array).toBeInstanceOf(ast.ArrayLiteral);
    expect((array as ast.ArrayLiteral).elements?.length).toBe(3);

    if (array instanceof ast.ArrayLiteral && array.elements) {
        testIntegerLiteral(array.elements[0], 1);
        testInfixExpression(array.elements[1], 2, "*", 2);
        testInfixExpression(array.elements[2], 3, "+", 3);
    }
});
test("Test Parsing Index Expression", () => {
    const input = `myArray[1 + 1]`;
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    checkParserErrors(p);
    const stmt = program.statements[0] as ast.ExpressionStatement;
    const indexExp = stmt.expression;
    expect(indexExp).toBeInstanceOf(ast.IndexExpression);

    if (indexExp instanceof ast.IndexExpression) {
        testIdentifier(indexExp.left, "myArray");
        testInfixExpression(indexExp.index, 1, "+", 1);
    }
});

function testLetStatement(s: ast.Statement, name: string) {
    expect(s.tokenLiteral()).toBe("let");

    expect(s).toBeInstanceOf(ast.LetStatement);
    const letStmt = s as ast.LetStatement;

    expect(letStmt.name?.value).toBe(name);
    expect(letStmt.name?.tokenLiteral()).toBe(name);
}
function testLiteralExpression(expression: ast.Expression, expected: unknown) {
    switch (typeof expected) {
        case "number":
            return testIntegerLiteral(expression, expected);
        case "string":
            return testIdentifier(expression, expected);
        case "boolean":
            return testBooleanLiteral(expression, expected);
        default:
            console.error(`Type of exp not handled. got=${typeof expression}`);
            return false;
    }
}

function testIntegerLiteral(il: ast.Expression, value: number) {
    expect(il).toBeInstanceOf(ast.IntegerLiteral);
    expect((il as ast.IntegerLiteral).value).toBe(value);
    expect((il as ast.IntegerLiteral).tokenLiteral()).toBe(`${value}`);
}

function testIdentifier(exp: ast.Expression, value: string) {
    expect(exp).toBeInstanceOf(ast.Identifier);
    expect((exp as ast.Identifier).value).toBe(value);
    expect((exp as ast.Identifier).tokenLiteral()).toBe(value);
}
function testBooleanLiteral(exp: ast.Expression, value: boolean) {
    expect(exp).toBeInstanceOf(ast.BooleanLiteral);
    expect((exp as ast.BooleanLiteral).value).toBe(value);
    expect((exp as ast.BooleanLiteral).tokenLiteral()).toBe(`${value}`);
}

function testInfixExpression(
    exp: ast.Expression,
    left: unknown,
    operator: string,
    right: unknown,
) {
    expect(exp).toBeInstanceOf(ast.InfixExpression);
    const infExp = exp as ast.InfixExpression;
    testLiteralExpression(infExp.left, left);
    expect(infExp.operator).toBe(operator);
    if (infExp.right) {
        testLiteralExpression(infExp.right, right);
    }
}
function checkParserErrors(p: Parser) {
    const errors = p.errors;
    if (errors.length === 0) return;

    errors.forEach((error) => {
        console.log(error);
    });

    expect(errors.length).toBe(0);
}

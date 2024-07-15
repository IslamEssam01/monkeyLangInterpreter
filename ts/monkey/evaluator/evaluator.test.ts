import { expect, test } from "vitest";
import Lexer from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { evaluate } from "./evaluator";
import * as object from "../object/object";
import { Environment } from "../object/environment";

test("Test Eval Integer Expression", () => {
    const tests = [
        { input: "5", expected: 5 },
        { input: "10", expected: 10 },
        { input: "-5", expected: -5 },
        { input: "-10", expected: -10 },
        { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
        { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
        { input: "-50 + 100 + -50", expected: 0 },
        { input: "5 * 2 + 10", expected: 20 },
        { input: "5 + 2 * 10", expected: 25 },
        { input: "20 + 2 * -10", expected: 0 },
        { input: "50 / 2 * 2 + 10", expected: 60 },
        { input: "2 * (5 + 10)", expected: 30 },
        { input: "3 * 3 * 3 + 10", expected: 37 },
        { input: "3 * (3 * 3) + 10", expected: 37 },
        { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
    ];
    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    });
});

test("Test Eval Boolean Expression", () => {
    const tests = [
        { input: "true", expected: true },
        { input: "false", expected: false },
        { input: "1 < 2", expected: true },
        { input: "1 > 2", expected: false },
        { input: "1 < 1", expected: false },
        { input: "1 > 1", expected: false },
        { input: "1 == 1", expected: true },
        { input: "1 != 1", expected: false },
        { input: "1 == 2", expected: false },
        { input: "1 != 2", expected: true },
        { input: "true == true", expected: true },
        { input: "false == false", expected: true },
        { input: "true == false", expected: false },
        { input: "true != false", expected: true },
        { input: "false != true", expected: true },
        { input: "(1 < 2) == true", expected: true },
        { input: "(1 < 2) == false", expected: false },
        { input: "(1 > 2) == true", expected: false },
        { input: "(1 > 2) == false", expected: true },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        testBooleanObject(evaluated, test.expected);
    });
});

test("Test Bang Operator", () => {
    const tests = [
        { input: "!true", expected: false },
        { input: "!false", expected: true },
        { input: "!5", expected: false },
        { input: "!!true", expected: true },
        { input: "!!false", expected: false },
        { input: "!!5", expected: true },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        testBooleanObject(evaluated, test.expected);
    });
});

test("Test Eval If Else Expression", () => {
    const tests = [
        { input: "if (true) { 10 }", expected: 10 },
        { input: "if (false) { 10 }", expected: null },
        { input: "if (1) { 10 }", expected: 10 },
        { input: "if (1 < 2) { 10 }", expected: 10 },
        { input: "if (1 > 2) { 10 }", expected: null },
        { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
        { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        if (test.expected !== null) {
            testIntegerObject(evaluated, test.expected);
        } else {
            testNullObject(evaluated);
        }
    });
});

test("Test Eval Return Statement", () => {
    const tests = [
        { input: "return 10;", expected: 10 },
        { input: "return 10; 9;", expected: 10 },
        { input: "return 2 * 5; 9;", expected: 10 },
        { input: "9; return 2 * 5; 9;", expected: 10 },
        {
            input: `
    if (10 > 1) {
      if (10 > 1) {
        return 10;
      }
      return 1;
    }
  `,
            expected: 10,
        },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    });
});

test("Test Error Handling", () => {
    const tests = [
        {
            input: "5 + true;",
            expectedMessage: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "5 + true; 5;",
            expectedMessage: "type mismatch: INTEGER + BOOLEAN",
        },
        { input: "-true", expectedMessage: "unknown operator: -BOOLEAN" },
        {
            input: "true + false;",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "5; true + false; 5",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "if (10 > 1) { true + false; }",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: `
if (10 > 1) {
if (10 > 1) {
return true + false;
}
return 1;
}
`,
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        { input: "foobar", expectedMessage: "identifier not found: foobar" },
        {
            input: `"Hello" - "World"`,
            expectedMessage: "unknown operator: STRING - STRING",
        },
        {
            input: `{"name": "Monkey"}[fn(x) { x }];`,
            expectedMessage: "unusable as hash key: FUNCTION",
        },
        {
            input: "[1, 2, 3][3]",
            expectedMessage: "array index out of range , maxIndex=2",
        },
        {
            input: "[1, 2, 3][-1]",
            expectedMessage: "array index can't be negative",
        },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        expect(evaluated).toBeInstanceOf(object.Error);
        expect((evaluated as object.Error).message).toBe(test.expectedMessage);
    });
});

test("Test Let Statements", () => {
    const tests = [
        { input: "let a = 5; a;", expected: 5 },
        { input: "let a = 5 * 5; a;", expected: 25 },
        { input: "let a = 5; let b = a; b;", expected: 5 },
        { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    });
});
test("Test Function Object", () => {
    const input = "fn(x) { x + 2; };";
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(object.Function);
    expect((evaluated as object.Function).parameters.length).toBe(1);
    expect((evaluated as object.Function).parameters[0].string()).toBe("x");

    const expectedBody = "(x + 2)";
    expect((evaluated as object.Function).body.string()).toBe(expectedBody);
});

test("Test Function Application", () => {
    const tests = [
        { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
        {
            input: "let identity = fn(x) { return x; }; identity(5);",
            expected: 5,
        },
        { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
        { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
        {
            input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
            expected: 20,
        },
        { input: "fn(x) { x; }(5)", expected: 5 },
    ];
    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        testIntegerObject(evaluated, test.expected);
    });
});

test("TestClosures", () => {
    const input = `
let newAdder = fn(x) {
fn(y) { x + y };
};
let addTwo = newAdder(2);
addTwo(2);`;
    testIntegerObject(testEval(input), 4);
});

test("Test String Literal", () => {
    const input = `"Hello World!"`;
    const evaluated = testEval(input);
    const str = evaluated as object.String;
    if (!str) {
        throw new Error(
            `object is not String. got=${typeof evaluated} (${evaluated})`,
        );
    }
    if (str.value !== "Hello World!") {
        throw new Error(`String has wrong value. got=${str.value}`);
    }
});

test("Test String Concatenation", () => {
    const input = `"Hello" + " " + "World!"`;
    const evaluated = testEval(input);
    const str = evaluated as object.String;
    if (!str) {
        throw new Error(
            `object is not String. got=${typeof evaluated} (${evaluated})`,
        );
    }
    if (str.value !== "Hello World!") {
        throw new Error(`String has wrong value. got=${str.value}`);
    }
});

const tests = [
    { input: `"hello" == "hello"`, expected: true },
    { input: `"hello" != "hello"`, expected: false },
    { input: `"no" == "hello"`, expected: false },
    { input: `"no" != "hello"`, expected: true },
];

for (const tt of tests) {
    test("Test String Equality", () => {
        const evaluated = testEval(tt.input);
        const res = evaluated as object.Boolean;
        if (!res) {
            throw new Error(
                `object is not Boolean. got=${typeof evaluated} (${evaluated})`,
            );
        }
        if (tt.expected !== res.value) {
            throw new Error(`Boolean has wrong value. got=${res.value}`);
        }
    });
}

test("Test Builtin Functions", () => {
    const tests = [
        { input: `len("")`, expected: 0 },
        { input: `len("four")`, expected: 4 },
        { input: `len("hello world")`, expected: 11 },
        {
            input: `len(1)`,
            expected: "argument to `len` not supported, got INTEGER",
        },
        {
            input: `len("one", "two")`,
            expected: "Too many arguments, expected 1, got 2",
        },
        // {"input": `len([1, 2, 3])`, "expected": 3},
        // {"input": `len([])`, "expected": 0},
        // {"input": `puts("hello", "world!")`, "expected": null},
        // {"input": `first([1, 2, 3])`, "expected": 1},
        // {"input": `first([])`, "expected": null},
        {
            input: `first(1)`,
            expected: "argument to `first` must be ARRAY, got INTEGER",
        },
        // {"input": `last([1, 2, 3])`, "expected": 3},
        // {"input": `last([])`, "expected": null},
        {
            input: `last(1)`,
            expected: "argument to `last` must be ARRAY, got INTEGER",
        },
        // {"input": `rest([1, 2, 3])`, "expected": [2, 3]},
        // {"input": `rest([])`, "expected": null},
        // {"input": `push([], 1)`, "expected": [1]},
        {
            input: `push(1, 1)`,
            expected: "first argument to `push` must be ARRAY, got INTEGER",
        },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);

        if (typeof test.expected === "string") {
            expect(evaluated).toBeInstanceOf(object.Error);
            expect((evaluated as object.Error).message).toBe(test.expected);
        } else {
            testIntegerObject(evaluated, test.expected);
        }
    });
});
test("Test Array Literals", () => {
    const input = `[1, 2 * 2, 3 + 3]`;
    const array = testEval(input);
    expect(array).toBeInstanceOf(object.Array);
    expect((array as object.Array).elements.length).toBe(3);

    if (array instanceof object.Array) {
        testIntegerObject(array.elements[0], 1);
        testIntegerObject(array.elements[1], 4);
        testIntegerObject(array.elements[2], 6);
    }
});
test("Test Array Index Expressions", () => {
    const tests = [
        { input: "[1, 2, 3][0]", expected: 1 },
        { input: "[1, 2, 3][1]", expected: 2 },
        { input: "[1, 2, 3][2]", expected: 3 },
        { input: "let i = 0; [1][i];", expected: 1 },
        { input: "[1, 2, 3][1 + 1];", expected: 3 },
        { input: "let myArray = [1, 2, 3]; myArray[2];", expected: 3 },
        {
            input: "let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];",
            expected: 6,
        },
        {
            input: "let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]",
            expected: 2,
        },
    ];

    tests.forEach((test) => {
        const evaluated = testEval(test.input);
        expect((evaluated as object.Integer).value).toBe(test.expected);
    });
});

test("Test Hash Literals", () => {
    const input = `let two = "two";
	{
		"one": 10 - 9,
		two: 1 + 1,
		"thr" + "ee": 6 / 2,
		4: 4,
		true: 5,
		false: 6
	}`;

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(object.Hash);
    const expected = new Map<object.HashKey, number>([
        [new object.String("one").hashKey(), 1],
        [new object.String("two").hashKey(), 2],
        [new object.String("three").hashKey(), 3],
        [new object.Integer(4).hashKey(), 4],
        [new object.Boolean(true).hashKey(), 5],
        [new object.Boolean(false).hashKey(), 6],
    ]);
    const result = evaluated as object.Hash;
    expect(result.pairs.size).toBe(expected.size);

    expected.forEach((val, key) => {
        const pair = result.pairs.get(key);
        expect(pair).not.toBeUndefined();
        if (pair) testIntegerObject(pair.value, val);
    });
});
test("Test Ternary", () => {
    const input = `true ? 1 : 4;`;
    const res = testEval(input);
    expect(res).toBeInstanceOf(object.Integer);

    if (res instanceof object.Integer) {
        testIntegerObject(res, 1);
    }
});
function testEval(input: string) {
    const l = new Lexer(input);
    const p = new Parser(l);

    const program = p.parseProgram();
    const env = new Environment();
    return evaluate(program, env);
}
function testIntegerObject(obj: object.ObjectInterface, expected: number) {
    expect(obj).toBeInstanceOf(object.Integer);
    expect((obj as object.Integer).value).toBe(expected);
}

function testBooleanObject(obj: object.ObjectInterface, expected: boolean) {
    expect(obj).toBeInstanceOf(object.Boolean);
    expect((obj as object.Boolean).value).toBe(expected);
}

function testNullObject(obj: object.ObjectInterface) {
    expect(obj).toBeInstanceOf(object.Null);
}

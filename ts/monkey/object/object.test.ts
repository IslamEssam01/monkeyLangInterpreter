import { expect, test } from "vitest";
import * as object from "./object";

test("Test String Hash Key", () => {
    const hello1 = new object.String("Hello World");
    const hello2 = new object.String("Hello World");
    const diff1 = new object.String("My name is johnny");
    const diff2 = new object.String("My name is johnny");

    expect(hello1.hashKey()).toStrictEqual(hello2.hashKey());
    expect(diff1.hashKey()).toStrictEqual(diff2.hashKey());
    expect(hello1.hashKey()).not.toStrictEqual(diff1.hashKey());
});

test("Test Boolean Hash Key", () => {
    const true1 = new object.Boolean(true);
    const true2 = new object.Boolean(true);
    const false1 = new object.Boolean(false);
    const false2 = new object.Boolean(false);

    expect(true1.hashKey()).toStrictEqual(true2.hashKey());
    expect(false2.hashKey()).toStrictEqual(false2.hashKey());
    expect(true1.hashKey()).not.toStrictEqual(false1.hashKey());
});

test("Test Integer Hash Key", () => {
    const one1 = new object.Integer(1);
    const one2 = new object.Integer(1);
    const two1 = new object.Integer(2);
    const two2 = new object.Integer(2);

    expect(one1.hashKey()).toStrictEqual(one2.hashKey());
    expect(two1.hashKey()).toStrictEqual(two2.hashKey());
    expect(one1.hashKey()).not.toStrictEqual(two1.hashKey());
});

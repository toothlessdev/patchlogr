import { describe, test, expect } from "vitest";
import { stableStringify } from "../stableStringify";

describe("stableStringify", () => {
    test("should stringify json", () => {
        expect(stableStringify({ a: 1, b: 2, c: 3 })).toBe(
            JSON.stringify({ a: 1, b: 2, c: 3 }),
        );
    });

    test("should stringify json in a stable order", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 2, a: 1 };

        expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    test("should stringify nested objects with stable key order", () => {
        const obj1 = { a: 1, nested: { x: 10, y: 20 } };
        const obj2 = { nested: { y: 20, x: 10 }, a: 1 };

        expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    test("should stringify deeply nested objects with stable key order", () => {
        const obj1 = {
            level1: {
                level2: {
                    c: 3,
                    b: 2,
                    a: 1,
                },
            },
        };
        const obj2 = {
            level1: {
                level2: {
                    a: 1,
                    b: 2,
                    c: 3,
                },
            },
        };

        expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    test("should stringify arrays containing objects with stable key order", () => {
        const obj1 = {
            items: [
                { z: 3, y: 2, x: 1 },
                { c: "c", b: "b", a: "a" },
            ],
        };
        const obj2 = {
            items: [
                { x: 1, y: 2, z: 3 },
                { a: "a", b: "b", c: "c" },
            ],
        };

        expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    test("should handle null and primitive values correctly", () => {
        const obj1 = { b: null, a: 1, c: "string", d: true };
        const obj2 = { d: true, c: "string", a: 1, b: null };

        expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    test("should produce deterministic output for canonical spec hashing", () => {
        const spec1 = {
            operationId: "getUser",
            responses: {
                "200": {
                    schema: {
                        type: "object",
                        properties: { name: {}, id: {} },
                    },
                },
            },
            parameters: [{ name: "id", in: "path", required: true }],
        };
        const spec2 = {
            parameters: [{ required: true, in: "path", name: "id" }],
            responses: {
                "200": {
                    schema: {
                        properties: { id: {}, name: {} },
                        type: "object",
                    },
                },
            },
            operationId: "getUser",
        };

        expect(stableStringify(spec1)).toBe(stableStringify(spec2));
    });

    test("should output nested object keys in sorted order", () => {
        const obj = { b: 2, a: { z: 1, y: 2 } };
        const result = stableStringify(obj);

        expect(result).toBe(JSON.stringify({ a: { y: 2, z: 1 }, b: 2 }));
    });

    test("should sort keys in arrays of objects", () => {
        const obj = { items: [{ b: 1, a: 2 }] };
        const result = stableStringify(obj);

        expect(result).toBe(JSON.stringify({ items: [{ a: 2, b: 1 }] }));
    });
});

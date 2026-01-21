import { describe, test, expect } from "vitest";
import { stableStringify } from "../stableStringify";

describe("stableStringify", () => {
    test("should stringify json", () => {
        expect(stableStringify({ a: 1, b: 2, c: 3 })).toBe(
            '{"a":1,"b":2,"c":3}',
        );
    });

    test("should stringify json in a stable order", () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 2, a: 1 };

        expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });
});

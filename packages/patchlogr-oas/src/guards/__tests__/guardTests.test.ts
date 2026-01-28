import { describe, test, expect } from "vitest";
import { isSchemaObject } from "../schemaGuards";

describe("Guards", () => {
    describe("isSchemaObject", () => {
        test("스키마 객체에 대해 true 를 반환한다", () => {
            expect(isSchemaObject({ type: "string" })).toBe(true);
        });

        test("참조 객체에 대해 false 를 반환한다", () => {
            expect(isSchemaObject({ $ref: "#/definitions/SomeType" })).toBe(
                false,
            );
        });

        test("null에 대해 false 를 반환한다", () => {
            expect(isSchemaObject(null)).toBe(false);
        });
    });
});

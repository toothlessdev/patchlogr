import { describe, test, expect } from "vitest";
import { isSchemaObject, isReferenceObject } from "../schemaGuards";

describe("Guards", () => {
    describe("isSchemaObject", () => {
        test("should return true for valid schema object", () => {
            expect(isSchemaObject({ type: "string" })).toBe(true);
        });

        test("should return false for reference object", () => {
            expect(isSchemaObject({ $ref: "#/definitions/SomeType" })).toBe(
                false,
            );
        });

        test("should return false for null", () => {
            expect(isSchemaObject(null)).toBe(false);
        });
    });
});

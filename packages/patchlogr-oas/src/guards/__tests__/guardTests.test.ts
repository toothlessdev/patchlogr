import { describe, test, expect } from "vitest";
import { isSchemaObject, isReferenceObject } from "../schemaGuards";
import { isV2GeneralParameter, isV3ParameterObject } from "../parameterGuards";

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

    describe("isV2GeneralParameter", () => {
        test("should return true for query parameter", () => {
            const param = { name: "id", in: "query", type: "string" };
            expect(isV2GeneralParameter(param)).toBe(true);
        });

        test("should return false for body parameter", () => {
            const param = { name: "body", in: "body", schema: {} };
            expect(isV2GeneralParameter(param)).toBe(false);
        });
    });

    describe("isV3ParameterObject", () => {
        test("should return true for valid V3 parameter", () => {
            const param = {
                name: "id",
                in: "query",
                schema: { type: "string" },
            };
            expect(isV3ParameterObject(param)).toBe(true);
        });

        test("should return false for reference object", () => {
            expect(
                isV3ParameterObject({ $ref: "#/components/parameters/userId" }),
            ).toBe(false);
        });
    });
});

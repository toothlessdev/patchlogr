import { describe, expect, test } from "vitest";
import { toCanonicalBody } from "./toCanonicalRequestBody";

describe("toCanonicalBody", () => {
    test("request body를 CanonicalBody로 변환한다", () => {
        const body: any = {
            required: true,
            content: {
                "application/json": {
                    schema: { type: "object" },
                },
            },
        };
        const result = toCanonicalBody(body);
        expect(result).toEqual({
            required: true,
            content: {
                "application/json": {
                    schema: { type: "object" },
                },
            },
        });
    });
});

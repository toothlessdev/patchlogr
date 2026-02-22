import { describe, expect, test } from "vitest";
import { toCanonicalResponses } from "./toCanonicalResponse";

describe("toCanonicalResponses", () => {
    test("응답을 CanonicalResponse로 변환한다", () => {
        const responses: any = {
            "200": {
                description: "OK",
                content: {
                    "application/json": {
                        schema: { type: "string" },
                    },
                },
            },
        };
        const result = toCanonicalResponses(responses);
        expect(result["200"]).toEqual({
            description: "OK",
            content: {
                "application/json": {
                    schema: { type: "string" },
                },
            },
        });
    });
});

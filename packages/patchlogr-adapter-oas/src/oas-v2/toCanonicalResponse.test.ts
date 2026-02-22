import { describe, expect, test } from "vitest";
import { toCanonicalResponses } from "./toCanonicalResponse";

describe("toCanonicalResponses", () => {
    test("응답을 CanonicalResponse로 변환한다", () => {
        const doc: any = { produces: ["application/json"] };
        const responses: any = {
            "200": {
                description: "OK",
                schema: { type: "string" },
            },
        };
        const result = toCanonicalResponses(doc, responses);
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

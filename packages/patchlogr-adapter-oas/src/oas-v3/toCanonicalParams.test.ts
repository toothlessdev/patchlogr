import { describe, expect, test } from "vitest";
import { toCanonicalParams } from "./toCanonicalParams";

describe("toCanonicalParams", () => {
    test("파라미터를 CanonicalParam 배열로 변환한다", () => {
        const params: any[] = [
            {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ];
        const result = toCanonicalParams(params);
        expect(result).toEqual([
            {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
            },
        ]);
    });
});

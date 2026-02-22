import { describe, expect, test } from "vitest";
import { toCanonicalParam } from "./toCanonicalParam";

describe("toCanonicalParam", () => {
    test("일반 파라미터를 CanonicalParam으로 변환한다", () => {
        const param = {
            name: "id",
            in: "path",
            required: true,
            type: "string",
            description: "ID",
            default: "1",
        };
        const result = toCanonicalParam(param);
        expect(result).toEqual({
            name: "id",
            in: "path",
            required: true,
            description: "ID",
            schema: {
                type: "string",
                default: "1",
            },
        });
    });

    test("array 타입의 파라미터에 collectionFormat을 포함한다", () => {
        const param = {
            name: "tags",
            in: "query",
            required: false,
            type: "array",
            items: { type: "string" },
            collectionFormat: "csv",
        };
        const result = toCanonicalParam(param);
        expect(result.schema?.collectionFormat).toBe("csv");
    });
});

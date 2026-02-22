import { describe, expect, test } from "vitest";
import { toCanonicalBody } from "./toCanonicalRequestBody";

describe("toCanonicalBody", () => {
    test("body 파라미터를 CanonicalBody로 변환한다", () => {
        const doc: any = { consumes: ["application/json"] };
        const op: any = {};
        const bodyParam: any = {
            required: true,
            schema: { type: "object" },
        };
        const result = toCanonicalBody(doc, op, bodyParam, []);
        expect(result).toEqual({
            required: true,
            content: {
                "application/json": {
                    schema: { type: "object" },
                },
            },
        });
    });

    test("form data를 CanonicalBody로 변환한다", () => {
        const doc: any = {};
        const op: any = {
            consumes: ["application/x-www-form-urlencoded"],
        };
        const formDataParams: any[] = [
            { name: "field", type: "string", required: true },
        ];
        const result = toCanonicalBody(doc, op, undefined, formDataParams);

        expect(result?.required).toBe(true);

        const schema =
            result?.content["application/x-www-form-urlencoded"]?.schema;
        expect(schema?.properties?.field).toEqual({
            type: "string",
            required: true,
        });
    });

    test("form data의 추가 프로퍼티 (default, enum)을 유지하고 items를 정규화한다", () => {
        const doc: any = {};
        const op: any = {
            consumes: ["application/x-www-form-urlencoded"],
        };
        const formDataParams: any[] = [
            {
                name: "status",
                type: "string",
                enum: ["available", "pending", "sold"],
                default: "available",
                required: true,
            },
            {
                name: "tags",
                type: "array",
                items: {
                    type: "string",
                    default: "new",
                },
                collectionFormat: "multi",
                required: false,
            },
        ];

        const result = toCanonicalBody(doc, op, undefined, formDataParams);
        const schema =
            result?.content["application/x-www-form-urlencoded"]?.schema;

        expect(schema).toEqual({
            type: "object",
            properties: {
                status: {
                    type: "string",
                    enum: ["available", "pending", "sold"],
                    default: "available",
                    required: true,
                },
                tags: {
                    type: "array",
                    items: {
                        type: "string",
                        default: "new",
                    },
                    collectionFormat: "multi",
                    required: false,
                },
            },
        });
    });
});

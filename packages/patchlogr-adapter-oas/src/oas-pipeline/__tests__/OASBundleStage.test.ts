import { describe, expect, test } from "vitest";
import { OASBundleStage } from "../OASBundleStage";
import type { OASStageContext } from "../OASStageContext";
import path from "path";
import type { OpenAPIV3 } from "openapi-types";

describe("OASBundleStage", () => {
    test("external $ref를 dereference한다", async () => {
        const oasBundleStage = new OASBundleStage();

        const input: OASStageContext = {
            source: path.resolve(__dirname, "../../__fixtures__/base.json"),
        };

        const output = await oasBundleStage.execute(input);
        expect(output.oas).not.toHaveProperty("$ref");

        const response = output.oas?.paths?.["/pet"]?.get?.responses?.[
            "200"
        ] as OpenAPIV3.ResponseObject;

        const schema = response?.content?.["application/json"]
            ?.schema as OpenAPIV3.SchemaObject;

        expect(schema).toEqual({
            type: "object",
            properties: {
                id: {
                    type: "integer",
                },
                name: {
                    type: "string",
                },
            },
        });
    });
});

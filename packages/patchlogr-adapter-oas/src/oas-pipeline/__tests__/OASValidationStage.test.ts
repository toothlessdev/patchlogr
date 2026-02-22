import type { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { describe, expect, test } from "vitest";
import SwaggerParser from "@apidevtools/swagger-parser";
import { OASValidationStage } from "../OASValidationStage";
import type { OASStageContext } from "../OASStageContext";

const oasFixtureV2: OpenAPIV2.Document = {
    swagger: "2.0",
    info: { title: "Test API", version: "1.1.0" },
    paths: {},
};

const oasFixtureV3: OpenAPIV3.Document = {
    openapi: "3.0.1",
    info: { title: "Test API", version: "1.1.0" },
    paths: {},
};

const oasFixtureV3_1: OpenAPIV3_1.Document = {
    openapi: "3.1.0",
    info: { title: "Test API", version: "1.1.0" },
    paths: {},
};

const invalidOasFixture = {
    openapi: "3.1.0",
    info: { title: "Test API", version: "1.1.0" },
    // Missing 'paths' field
};

describe("SwaggerValidationStage", () => {
    test("3.0.x 버전을 파싱한다", async () => {
        const swaggerValidationStage = new OASValidationStage();
        const input: OASStageContext = {
            source: "",
            oas: oasFixtureV3,
        };
        const result = await swaggerValidationStage.execute(input);
        expect(result.oasVersion).toBe("3.0.1");
    });

    test("2.0 버전을 파싱한다", async () => {
        const swaggerValidationStage = new OASValidationStage();
        const input: OASStageContext = {
            source: "",
            oas: oasFixtureV2,
        };
        const result = await swaggerValidationStage.execute(input);
        expect(result.oasVersion).toBe("2.0");
    });

    test("3.1 버전을 파싱한다", async () => {
        const swaggerValidationStage = new OASValidationStage();
        const input: OASStageContext = {
            source: "",
            oas: oasFixtureV3_1,
        };
        const result = await swaggerValidationStage.execute(input);
        expect(result.oasVersion).toBe("3.1.0");
    });

    test("올바른 OAS 문서를 검증한다", async () => {
        expect(async () => {
            const swaggerValidationStage = new OASValidationStage();
            const input: OASStageContext = {
                source: "",
                oas: oasFixtureV3,
            };
            await swaggerValidationStage.execute(input);
        }).not.toThrow();
    });

    test("올바르지 않은 OAS 문서를 검증한다", async () => {
        expect(async () => {
            const swaggerValidationStage = new OASValidationStage();
            const input: OASStageContext = {
                source: "",
                oas: invalidOasFixture as any,
            };
            await swaggerValidationStage.execute(input);
        }).rejects.toThrow("Invalid OpenAPI Specification");
    });
    test("input.oas가 없으면 에러를 던진다", async () => {
        const swaggerValidationStage = new OASValidationStage();
        const input: OASStageContext = {
            source: "{}",
            options: {},
        };

        await expect(swaggerValidationStage.execute(input)).rejects.toThrow(
            "OAS object is missing in context. A previous stage might have failed.",
        );
    });

    test("검증된 oas object를 context에 업데이트한다", async () => {
        const swaggerValidationStage = new OASValidationStage();
        const input: OASStageContext = {
            source: "{}",
            oas: {
                swagger: "2.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
            },
            options: {},
        };

        const originalValidate = SwaggerParser.validate;
        const validatedOas = { ...input.oas, _validated: true };
        SwaggerParser.validate = async () => validatedOas as any;

        try {
            const result = await swaggerValidationStage.execute(input);
            expect(result.oas).toEqual(validatedOas);
        } finally {
            SwaggerParser.validate = originalValidate;
        }
    });
});

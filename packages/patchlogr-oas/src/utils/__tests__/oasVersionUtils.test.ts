import { describe, expect, test } from "vitest";
import { getOASVersion, isOpenAPIV2, isOpenAPIV3 } from "../oasVersionUtils";

describe("OASVersionUtils", () => {
    test("getOASVersion should return correct version for 3.+", () => {
        const oasVersion = getOASVersion({
            openapi: "3.0.1",
            info: {
                title: "Test API",
                version: "1.0.0",
            },
            paths: {},
        });

        expect(oasVersion).toBe("3.0.1");
    });

    test("getOASVersion should return correct version for 2.0", () => {
        const oasVersion = getOASVersion({
            swagger: "2.0",
            info: {
                title: "Test API",
                version: "1.0.0",
            },
            paths: {},
        });

        expect(oasVersion).toBe("2.0");
    });

    test("getOASVersion should return undefined for unknown version", () => {
        const oasVersion = getOASVersion({
            info: {
                title: "Test API",
                version: "1.0.0",
            },
            paths: {},
        } as any);

        expect(oasVersion).toBeUndefined();
    });

    test("isOpenAPIV3 should correctly identify OpenAPI v3 documents", () => {
        const isV3 = isOpenAPIV3({
            openapi: "3.0.1",
            info: {
                title: "Test API",
                version: "1.0.0",
            },
            paths: {},
        });

        expect(isV3).toBe(true);
    });

    test("isOpenAPIV2 should correctly identify OpenAPI v2 documents", () => {
        const isV2 = isOpenAPIV2({
            swagger: "2.0",
            info: {
                title: "Test API",
                version: "1.0.0",
            },
            paths: {},
        });

        expect(isV2).toBe(true);
    });
});

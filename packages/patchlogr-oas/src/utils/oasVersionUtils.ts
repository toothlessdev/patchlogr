import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";

export function getOASVersion(doc: OpenAPI.Document): string | undefined {
    if (isOpenAPIV3(doc)) {
        return doc.openapi;
    } else if (isOpenAPIV2(doc)) {
        return doc.swagger;
    }
    return undefined;
}

export function isOpenAPIV2(doc: OpenAPI.Document): doc is OpenAPIV2.Document {
    return "swagger" in doc && doc.swagger === "2.0";
}

export function isOpenAPIV3(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
    return "openapi" in doc && doc.openapi.startsWith("3.");
}

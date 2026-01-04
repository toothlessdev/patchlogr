import { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";

export class OASVersionUtils {
    constructor() {
        throw new Error(
            "SwaggerVersionUtils is a static utility class and cannot be instantiated.",
        );
    }

    static getOASVersion(doc: OpenAPI.Document): string | undefined {
        if (this.isOpenAPIV3(doc)) {
            return doc.openapi;
        } else if (this.isOpenAPIV2(doc)) {
            return doc.swagger;
        }
        return undefined;
    }

    static isOpenAPIV2(doc: OpenAPI.Document): doc is OpenAPIV2.Document {
        return "swagger" in doc && doc.swagger === "2.0";
    }

    static isOpenAPIV3(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
        return "openapi" in doc && doc.openapi.startsWith("3.");
    }
}

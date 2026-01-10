import { CanonicalSchema } from "@patchlogr/types";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import {
    isSchemaObject,
    OpenAPISchemaObject,
    isOpenAPIV3Schema,
} from "../guards/schemaGuards";
import { toCanonicalSchemaV2 } from "./toCanonicalSchemaV2";
import { toCanonicalSchemaV3 } from "./toCanonicalSchemaV3";

/**
 * OpenAPI Schema를 CanonicalSchema로 변환
 */
export function toCanonicalSchema(
    schema: OpenAPISchemaObject | undefined,
): CanonicalSchema {
    if (!isSchemaObject(schema)) {
        return schema || {};
    }

    if (isOpenAPIV3Schema(schema))
        return toCanonicalSchemaV3(schema as OpenAPIV3.SchemaObject);
    return toCanonicalSchemaV2(schema as OpenAPIV2.SchemaObject);
}

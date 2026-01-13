import { type CanonicalSchema } from "@patchlogr/types";
import type { OpenAPISchemaObject } from "../guards/schemaGuards";
import { isSchemaObject, isOpenAPIV3Schema } from "../guards/schemaGuards";
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

    if (isOpenAPIV3Schema(schema)) {
        return toCanonicalSchemaV3(schema);
    }
    return toCanonicalSchemaV2(schema);
}

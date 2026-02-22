import { type CanonicalSchema } from "@patchlogr/types";
import type { OpenAPISchemaObject } from "./schemaGuards";
import { isSchemaObject, isOpenAPIV3Schema } from "./schemaGuards";
import { toCanonicalSchema as toCanonicalSchemaV2 } from "../oas-v2/toCanonicalSchema";
import { toCanonicalSchema as toCanonicalSchemaV3 } from "../oas-v3/toCanonicalSchema";

/**
 * OpenAPI Schema를 CanonicalSchema로 변환 (V2/V3 디스패처)
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

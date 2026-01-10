import { CanonicalSchema, CanonicalSchemaProperty } from "@patchlogr/types";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

/**
 * OpenAPI Schema를 CanonicalSchema로 변환
 * - required 배열을 각 프로퍼티의 required boolean 필드로 변환하여 정규화
 * - 중첩된 스키마(properties, items)도 재귀적으로 변환
 *
 * @param {OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | undefined} schema - 변환할 OpenAPI Schema 객체
 * @returns {CanonicalSchema} 정규화된 CanonicalSchema 객체
 *
 * @example
 * const input = {
 *   type: "object",
 *   required: ["id"],
 *   properties: {
 *     id: { type: "integer" },
 *     name: { type: "string" }
 *   }
 * };
 *
 * const output = toCanonicalSchema(input);
 * // Result:
 * // {
 * //   type: "object",
 * //   properties: {
 * //     id: { type: "integer", required: true },
 * //     name: { type: "string", required: false }
 * //   }
 * // }
 */
export function toCanonicalSchema(
    schema: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject | undefined,
): CanonicalSchema {
    if (!schema || typeof schema !== "object") {
        return (schema || {}) as CanonicalSchema;
    }

    const canonical: CanonicalSchema = {
        ...(schema as any),
    };

    if (canonical.properties) {
        const requiredFields = new Set((canonical.required as string[]) || []);

        for (const [key, prop] of Object.entries(canonical.properties)) {
            const canonicalProp = toCanonicalSchema(
                prop as any,
            ) as CanonicalSchemaProperty;

            if (requiredFields.has(key)) {
                canonicalProp.required = true;
            } else {
                canonicalProp.required = false;
            }
            canonical.properties[key] = canonicalProp;
        }
    }

    if (canonical.items) {
        if (Array.isArray(canonical.items)) {
            canonical.items = canonical.items.map((item) =>
                toCanonicalSchema(item as any),
            );
        } else {
            canonical.items = toCanonicalSchema(canonical.items as any);
        }
    }

    delete canonical.required;
    return canonical;
}

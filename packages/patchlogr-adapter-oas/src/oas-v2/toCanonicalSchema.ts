import { type CanonicalSchema } from "@patchlogr/types";
import { type OpenAPIV2 } from "openapi-types";
import { isSchemaObject } from "../oas-common/schemaGuards";

export function toCanonicalSchema(
    schema: OpenAPIV2.SchemaObject | undefined,
): CanonicalSchema {
    if (!isSchemaObject(schema)) {
        return schema || {};
    }

    const { required, properties, items, type, ...rest } = schema;
    const canonicalSchema: CanonicalSchema = { ...rest };

    if (type) {
        canonicalSchema.type = type;
    }

    if (properties) {
        canonicalSchema.properties = {};
        const requiredFields = new Set(required);

        for (const [key, prop] of Object.entries(properties)) {
            const canonicalProp = toCanonicalSchema(prop);
            canonicalProp.required = requiredFields.has(key);
            canonicalSchema.properties[key] = canonicalProp;
        }
    }

    if (items) {
        if (Array.isArray(items)) {
            canonicalSchema.items = items.map((item) =>
                toCanonicalSchema(item),
            );
        } else {
            canonicalSchema.items = toCanonicalSchema(items);
        }
    }

    return canonicalSchema;
}

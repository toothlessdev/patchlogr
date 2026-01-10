import { CanonicalSchema } from "@patchlogr/types";
import { OpenAPIV2 } from "openapi-types";
import {
    isSchemaObject,
    OpenAPISchemaObjectWithCommonProps,
} from "../guards/schemaGuards";

export function toCanonicalSchemaV2(
    schema: OpenAPIV2.SchemaObject | undefined,
): CanonicalSchema {
    if (!isSchemaObject(schema)) {
        return schema || {};
    }

    const { required, properties, items, type, ...rest } =
        schema as OpenAPISchemaObjectWithCommonProps;

    const canonicalSchema: CanonicalSchema = { ...rest };

    if (type) {
        canonicalSchema.type = type;
    }

    if (properties) {
        canonicalSchema.properties = {};
        const requiredFields = new Set(required || []);

        for (const [key, prop] of Object.entries(properties)) {
            const canonicalProp = toCanonicalSchemaV2(prop);
            canonicalProp.required = requiredFields.has(key);
            canonicalSchema.properties[key] = canonicalProp;
        }
    }

    if (items) {
        if (Array.isArray(items)) {
            canonicalSchema.items = items.map((item) =>
                toCanonicalSchemaV2(item),
            );
        } else {
            canonicalSchema.items = toCanonicalSchemaV2(items);
        }
    }

    return canonicalSchema;
}

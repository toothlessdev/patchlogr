import { CanonicalSchema } from "@patchlogr/types";
import { OpenAPIV3 } from "openapi-types";
import {
    isSchemaObject,
    OpenAPISchemaObjectWithCommonProps,
} from "../guards/schemaGuards";

export function toCanonicalSchemaV3(
    schema: OpenAPIV3.SchemaObject | undefined,
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
            const canonicalProp = toCanonicalSchemaV3(prop);
            canonicalProp.required = requiredFields.has(key);
            canonicalSchema.properties[key] = canonicalProp;
        }
    }

    if (items) {
        if (Array.isArray(items)) {
            canonicalSchema.items = items.map((item) =>
                toCanonicalSchemaV3(item),
            );
        } else {
            canonicalSchema.items = toCanonicalSchemaV3(items);
        }
    }

    return canonicalSchema;
}

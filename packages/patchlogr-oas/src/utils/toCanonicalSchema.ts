import { CanonicalSchema, CanonicalSchemaProperty } from "@patchlogr/types";

export function toCanonicalSchema(schema: any): CanonicalSchema {
    if (!schema || typeof schema !== "object") {
        return schema;
    }

    const canonical: CanonicalSchema = {
        ...schema,
    };

    if (canonical.properties) {
        const requiredFields = new Set((canonical.required as string[]) || []);

        for (const [key, prop] of Object.entries(canonical.properties)) {
            const canonicalProp = toCanonicalSchema(
                prop,
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
        canonical.items = toCanonicalSchema(canonical.items);
    }

    delete canonical.required;
    return canonical;
}

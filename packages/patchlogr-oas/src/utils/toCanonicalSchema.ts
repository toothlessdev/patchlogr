import { CanonicalSchema } from "@patchlogr/types";

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
            canonical.properties[key] = toCanonicalSchema(prop);

            if (requiredFields.has(key)) {
                (canonical.properties[key] as any).required = true;
            } else {
                (canonical.properties[key] as any).required = false;
            }
        }
    }

    if (canonical.items) {
        canonical.items = toCanonicalSchema(canonical.items);
    }

    delete canonical.required;
    return canonical;
}

import { OpenAPIV2, OpenAPIV3 } from "openapi-types";

export type OpenAPISchemaObject =
    | OpenAPIV2.SchemaObject
    | OpenAPIV3.SchemaObject;

export type OpenAPISchemaObjectWithItems = OpenAPISchemaObject & {
    items?: any;
};

export type OpenAPISchemaObjectWithCommonProps =
    OpenAPISchemaObjectWithItems & {
        required?: string[];
        properties?: Record<string, any>;
        [key: string]: any;
    };

export function isSchemaObject(obj: any): obj is OpenAPISchemaObject {
    return (
        typeof obj === "object" &&
        obj !== null &&
        !("$ref" in obj) &&
        !Array.isArray(obj)
    );
}

export function isSchemaWithCommonProps(
    obj: any,
): obj is OpenAPISchemaObjectWithCommonProps {
    return (
        isSchemaObject(obj) &&
        "required" in obj &&
        "properties" in obj &&
        "items" in obj
    );
}

export function isReferenceObject(
    obj: any,
): obj is OpenAPIV2.ReferenceObject | OpenAPIV3.ReferenceObject {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "$ref" in obj &&
        typeof obj.$ref === "string"
    );
}

export function isOpenAPIV3Schema(obj: any): obj is OpenAPIV3.SchemaObject {
    if (!isSchemaObject(obj)) return false;

    if (
        "oneOf" in obj ||
        "anyOf" in obj ||
        "not" in obj ||
        "nullable" in obj ||
        "discriminator" in obj ||
        ("discriminator" in obj && typeof obj.discriminator === "object")
    )
        return true;

    return false;
}

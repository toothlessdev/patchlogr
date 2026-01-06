export type HTTPMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS"
    | "HEAD";

export type OperationKey = `${HTTPMethod} ${string}`;

export type JSONSchema = Record<string, unknown>;

export type CanonicalParam = {
    name: string;
    in: "path" | "query" | "header" | "cookie";
    required: boolean;
    schema?: JSONSchema;
    deprecated?: boolean;
    description?: string;
};

export type CanonicalBody = {
    required: boolean;
    content: Record<string, { schema?: JSONSchema }>;
};

export type CanonicalMessage = {
    params: CanonicalParam[];
    body?: CanonicalBody;
};

export type CanonicalResponse = {
    description?: string;
    headers?: Record<string, CanonicalParam>;
    content?: CanonicalBody["content"];
};

export type CanonicalOperation = {
    key: OperationKey;
    method: HTTPMethod;
    path: string;
    operationId?: string;
    tags?: string[];
    summary?: string;
    description?: string;
    deprecated?: boolean;

    security?: unknown;

    request: CanonicalMessage;
    responses: Record<string, CanonicalResponse>;
};

export interface CanonicalSpec {
    info?: {
        title?: string;
        version?: string;
        description?: string;
    };

    operations: Record<OperationKey, CanonicalOperation>;
}

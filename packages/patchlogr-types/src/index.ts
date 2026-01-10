export type HTTPMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS"
    | "HEAD"
    | "TRACE";

export type OperationKey = `${HTTPMethod} ${string}`;

/**
 * JSON Schema / OAS Schema를 normalize 한 형태
 * @example
 * {
 *   type: "object",
 *   properties: {
 *     "id": { type: "string", required: true },
 *     "name": { type: "string", required: false }
 *   }
 * }
 */
export type CanonicalSchema = {
    type?: string;
    format?: string;

    /**
     * properties[name].required 로 필드 required 여부를 박아둘 수 있게 별도 타입 분리
     */
    properties?: Record<string, CanonicalSchemaProperty>;

    items?: CanonicalSchema | CanonicalSchema[];
    enum?: unknown[];
    default?: unknown;
    description?: string;

    // minimum, maximum, pattern 등 나중에 확장 가능성 고려
    [key: string]: unknown;
};

export type CanonicalSchemaProperty = CanonicalSchema & {
    /**
     * 해당 필드가 required 배열에 포함되었는지 여부.
     * adapter에서 true/false로 normalize 해두는 걸 추천.
     */
    required?: boolean;
};

/**
 * 요청/응답 파라미터
 * @example
 * {
 *   name: "userId",
 *   in: "path",
 *   required: true,
 *   schema: { type: "string" }
 * }
 */
export type CanonicalParam = {
    name: string;
    /**
     * 파라미터 위치
     * @example path : /users/{id}
     * @example query : /users?id=1
     * @example header : Authorization: Bearer <token>
     * @example cookie : cookie: <token>
     */
    in: "path" | "query" | "header" | "cookie";
    required: boolean;
    schema?: CanonicalSchema;
    deprecated?: boolean;
    description?: string;
};

/**
 * 요청/응답 body
 * @example
 * {
 *   required: true,
 *   content: { "application/json": { schema: { type: "object" } } }
 * }
 */
export type CanonicalBody = {
    required: boolean;
    content: Record<string, { schema?: CanonicalSchema }>;
};

/**
 * 요청/메시지 공통 구조
 * @example
 * {
 *   params: [
 *     { name: "id", in: "path", required: true, schema: { type: "string" } }
 *   ],
 *   body: {
 *     required: true,
 *     content: { "application/json": { schema: { type: "object" } } }
 *   }
 * }
 */
export type CanonicalMessage = {
    params: CanonicalParam[];
    body?: CanonicalBody;
};

/**
 * 응답 헤더 전용 타입
 * @example
 * {
 *   required: true,
 *   schema: { type: "string" },
 *   description: "Rate limit remaining"
 * }
 */
export type CanonicalHeader = {
    required?: boolean;
    schema?: CanonicalSchema;
    deprecated?: boolean;
    description?: string;
};

/**
 * 응답
 * @example
 * {
 *   description: "Successful response",
 *   headers: {
 *     "X-Rate-Limit": { required: true, schema: { type: "integer" } }
 *   },
 *   content: {
 *     "application/json": { schema: { type: "object" } }
 *   }
 * }
 */
export type CanonicalResponse = {
    description?: string;
    headers?: Record<string, CanonicalHeader>;
    content?: CanonicalBody["content"];
};

/**
 * 보안 요구사항 (OpenAPI security requirement)
 * @example { JWT: [] }
 * @example { OAuth2: ["read:user", "write:user"] }
 */
export type CanonicalSecurityRequirement = Record<string, string[]>;

/**
 * 실제 계약에 영향을 주는 부분 (SemVer 계산에 쓰이는 코어)
 * @example
 * {
 *   key: "GET /users/{id}",
 *   method: "GET",
 *   path: "/users/{id}",
 *   request: { ... },
 *   responses: { "200": { ... } }
 * }
 */
export type CanonicalOperationContract = {
    key: OperationKey;
    method: HTTPMethod;
    path: string;
    deprecated?: boolean;
    security?: CanonicalSecurityRequirement[];

    request: CanonicalMessage;
    responses: Record<string, CanonicalResponse>;
};

/**
 * 문서/카테고리용 메타데이터
 * @example
 * {
 *   operationId: "getUserById",
 *   summary: "Get user details",
 *   tags: ["Users"]
 * }
 */
export type CanonicalOperationDoc = {
    operationId?: string;
    tags?: string[];
    summary?: string;
    description?: string;
};

export type CanonicalOperation = CanonicalOperationContract & {
    doc?: CanonicalOperationDoc;
};

export interface CanonicalSpec {
    info?: {
        title?: string;
        version?: string;
        description?: string;
    };

    /**
     * 전역 security (OpenAPI의 top-level security)
     * @example { JWT: [] }
     * @example { OAuth2: ["read:user", "write:user"] }
     */
    security?: CanonicalSecurityRequirement[];
    operations: Record<OperationKey, CanonicalOperation>;
}

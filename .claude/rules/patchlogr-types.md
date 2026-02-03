---
paths:
  - "packages/patchlogr-types/**"
---

# @patchlogr/types

OpenAPI 스펙을 표준화(Canonicalization)한 타입 정의 패키지.

## 설계 목적

OpenAPI v2/v3의 `allOf`, `anyOf`, `oneOf` 같은 composition을 모두 펼쳐서(flatten) diff 비교가 용이한 flat한 구조로 정의. 실제 변환은 `@patchlogr/oas`에서 수행.

## Exported Types

### Utility Types

```typescript
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "TRACE";
type OperationKey = `${HTTPMethod} ${string}`;  // e.g. "GET /users/{id}"
```

### Schema Types (allOf/anyOf/oneOf 펼친 형태)

```typescript
type CanonicalSchema = {
    type?: string | string[];
    format?: string;
    properties?: Record<string, CanonicalSchemaProperty>;
    items?: CanonicalSchema | CanonicalSchema[];
    enum?: unknown[];
    default?: unknown;
    description?: string;
    [key: string]: unknown;  // minimum, maximum, pattern 등
};

type CanonicalSchemaProperty = CanonicalSchema & {
    required?: boolean;  // required 배열에서 추출하여 필드에 직접 표시
};
```

### Request/Response Types

```typescript
type CanonicalParam = {
    name: string;
    in: "path" | "query" | "header" | "cookie";
    required: boolean;
    schema?: CanonicalSchema;
    deprecated?: boolean;
    description?: string;
};

type CanonicalBody = {
    required: boolean;
    content: Record<string, { schema?: CanonicalSchema }>;
};

type CanonicalMessage = {
    params: CanonicalParam[];
    body?: CanonicalBody;
};

type CanonicalHeader = {
    required?: boolean;
    schema?: CanonicalSchema;
    deprecated?: boolean;
    description?: string;
};

type CanonicalResponse = {
    description?: string;
    headers?: Record<string, CanonicalHeader>;
    content?: CanonicalBody["content"];
};
```

### Operation Types

```typescript
type CanonicalSecurityRequirement = Record<string, string[]>;

type CanonicalOperationContract = {
    key: OperationKey;
    method: HTTPMethod;
    path: string;
    deprecated?: boolean;
    security?: CanonicalSecurityRequirement[];
    request: CanonicalMessage;
    responses: Record<string, CanonicalResponse>;
};

type CanonicalOperationDoc = {
    operationId?: string;
    tags?: string[];
    summary?: string;
    description?: string;
};

type CanonicalOperation = CanonicalOperationContract & {
    doc?: CanonicalOperationDoc;
};
```

### Spec Type

```typescript
type CanonicalSpec = {
    info?: { title?: string; version?: string; description?: string };
    security?: CanonicalSecurityRequirement[];
    operations: Record<OperationKey, CanonicalOperation>;
};
```

## 의존성

- 없음 (기반 타입 레이어)

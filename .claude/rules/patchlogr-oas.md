---
paths:
    - "packages/patchlogr-oas/**"
---

# @patchlogr/oas

OpenAPI 문서를 표준화된 `CanonicalSpec` 형태로 변환하는 파이프라인 패키지.

## 핵심 역할

- OpenAPI v2/v3 문서를 입력받아 `@patchlogr/types`에 정의된 표준화된 형태로 변환
- `allOf`, `anyOf`, `oneOf` 같은 composition을 펼쳐서 flat한 구조로 만듦
- `$ref` 참조를 모두 역참조(dereference)하여 self-contained 문서 생성
- v2/v3 차이를 추상화하여 일관된 데이터 구조 제공

## Exported Functions

### preprocessOASDocument

```typescript
function preprocessOASDocument(
    doc: OpenAPI.Document,
    options?: OASStageOptions,
): Promise<OASStageContext>;
```

**파이프라인 단계**:

1. `OASBundleStage` - 외부 참조($ref) 번들링
2. `OASValidationStage` - OpenAPI 스펙 유효성 검증
3. `OASDereferenceStage` - $ref 참조를 실제 객체로 역참조
4. `OASCanonicalizeStage` - allOf/anyOf/oneOf 펼치고 `CanonicalSpec`으로 변환

**사용 예시**:

```typescript
import { preprocessOASDocument } from "@patchlogr/oas";

const result = await preprocessOASDocument(oasDoc, { skipValidation: false });
const canonicalSpec = result.canonicalSpec;
```

## Exported Types

```typescript
type OASStageOptions = {
    skipValidation?: boolean;
};
```

## 내부 구조

```
src/
  pipeline/           # 파이프라인 인프라
  canonicalize/
    v2/              # OpenAPI v2 → CanonicalSpec 변환
    v3/              # OpenAPI v3 → CanonicalSpec 변환
```

## 의존성

- `@patchlogr/types`: CanonicalSpec 등 타입
- `@apidevtools/swagger-parser`: OAS 파싱/검증/역참조

# 📘 Patchlogr 요구사항 명세서 (v0.1)

## 1. 개요 (Overview)

### 1.1 프로젝트 목적

Patchlogr는 **OpenAPI Specification(OAS) 변경사항을 분석하여**

-   변경 유형을 명확히 구분하고
-   Breaking Change를 조기에 감지하며
-   **Semantic Versioning(MAJOR.MINOR.PATCH)을 자동으로 산출**하고
-   PR 단계에서 변경 내용을 리뷰 가능한 형태로 제공하는
    **API Contract Change Management Tool**이다.

### 1.2 해결하려는 문제

-   API 변경의 영향도를 PR 시점에 파악하기 어려움
-   프론트엔드가 변경을 "나중에 깨짐"으로 인지
-   버전 업 기준이 팀/사람마다 다름
-   API 변경과 프론트 작업이 연결되지 않음

## 2. 지원 범위 (Scope)

### 2.1 지원 OpenAPI 버전

-   ✅ **OpenAPI 3.0.x (3.0.0 ~ 3.0.3)**
-   ❌ OpenAPI 2.0 / 3.1.x 미지원

> `openapi` 값이 3.0.x가 아닐 경우 Patchlogr는 실행 실패 처리 (추후 고려?)

### 2.2 비지원 항목 (v0.1)

-   GraphQL / AsyncAPI
-   API 실제 호출
-   런타임 validation
-   AI 기반 영향도 분석

## 3. 핵심 개념 정의

### 3.1 API Contract

-   OpenAPI 문서에 정의된 **path + method + request/response schema**
-   프론트엔드와 백엔드 간의 **암묵적 계약**

### 3.2 Operation

-   `{METHOD} {path}` 단위의 API 엔드포인트
-   예: `GET /api/v1/feeds/{feedId}`

## 4. 기능 요구사항 (Functional Requirements)

## 4.1 Core: OpenAPI 표준화 (Canonicalization)

### FR-1

Patchlogr는 OpenAPI 문서를 **Operation 단위의 Canonical Model**로 변환해야 한다.

#### Canonical Key

```
{METHOD} {path}
```

#### Canonical Operation Model (v0.1)

-   `operationId`
-   `method`
-   `path`
-   `tags[]`
-   `security[]`
-   `parameters[]`
    -   path / query / header / cookie
-   `requestBody`
    -   content-type별 schema
-   `responses`
    -   status code별 schema

### FR-2 (Schema Fingerprint)

Schema 비교를 위해 각 schema는 **Fingerprint 문자열**로 변환되어야 한다.

#### Fingerprint 포함 요소

-   type
-   format
-   required 여부
-   enum
-   properties key 목록

## 4.2 Core: Diff 엔진

### FR-3

Patchlogr는 두 OpenAPI 문서를 비교하여 다음 diff를 생성해야 한다.

#### Diff Categories

-   `addedOperations[]`
-   `removedOperations[]`
-   `modifiedOperations[]`

### FR-4

Modified Operation에 대해 변경 유형을 분류해야 한다.

-   parameters 변경
-   requestBody 변경
-   responses 변경
-   metadata 변경 (summary, description 등)

## 4.3 Breaking Change 판별

### FR-5

아래 조건 중 하나라도 만족하면 **Breaking Change**로 분류한다.

#### Operation 레벨

-   operation 삭제
-   HTTP method 삭제
-   path parameter 추가 / 삭제 / 변경

#### Request

-   requestBody 제거
-   required 필드 추가
-   필드 삭제
-   필드 type/format 변경
-   enum 값 제거
-   content-type 제거

#### Response

-   기존 response status 제거
-   response 필드 삭제
-   response 필드 type/format 변경
-   enum 값 제거
-   content-type 제거

## 4.4 Versioning: Semantic Versioning 자동 산출

### FR-6

Patchlogr는 diff 결과를 기반으로 **Semantic Versioning(MAJOR.MINOR.PATCH)** 중
하나의 **권장 버전 증가 타입**을 산출해야 한다.

```ts
recommendedBump: "major" | "minor" | "patch" | "none";
```

### 4.4.1 MAJOR Version 규칙 (Breaking)

다음 중 하나라도 발생하면 `major`:

-   operation 삭제
-   method 삭제
-   path parameter 변경
-   required 필드 추가
-   request/response 필드 삭제
-   필드 type/format 변경
-   enum 값 제거
-   response status 제거

> 의미: **기존 클라이언트가 깨질 가능성 있음**

### 4.4.2 MINOR Version 규칙 (Backward-compatible Feature)

`major`가 없고, 아래 중 하나라도 발생하면 `minor`:

-   새로운 operation 추가
-   optional(non-required) 필드 추가
-   새로운 response status 추가
-   enum 값 추가
-   optional query parameter 추가

> 의미: **기존 클라이언트는 동작 + 기능 확장**

### 4.4.3 PATCH Version 규칙 (Backward-compatible Fix)

`major`, `minor`가 없고 아래 중 하나라도 발생하면 `patch`:

-   summary / description / tags 수정
-   example / default / deprecated 변경
-   constraint 완화
    -   minLength 감소
    -   maxLength 증가
    -   minimum 감소
    -   maximum 증가
-   문서 순서 변경
-   설명만 변경되고 schema는 동일한 경우

> 의미: **API 계약은 동일, 문서·정확성 개선**

### 4.4.4 NONE

-   Canonical Model 기준 차이가 없을 경우 `"none"`

### 4.4.5 우선순위

```
major > minor > patch > none
```

## 4.5 Diff 결과 출력 (JSON)

### FR-7

Patchlogr는 diff 결과와 버전 산출 결과를 **machine-readable JSON**으로 출력해야 한다.

```json
{
    "summary": {
        "added": 1,
        "removed": 0,
        "modified": 2,
        "breaking": 0
    },
    "versioning": {
        "recommendedBump": "minor",
        "reasons": [
            "Added optional field: response.data.author.profileImageUrl"
        ]
    }
}
```

## 4.6 Reporter: Markdown 리포트

### FR-8

Patchlogr는 diff 결과를 **Markdown 리포트**로 변환할 수 있어야 한다.

#### 포함 항목

-   변경 요약
-   Breaking Changes
-   Version bump 권장 결과
-   Operation별 변경 요약

## 4.7 GitHub 자동화 (후순위)

### FR-9

Patchlogr는 GitHub Actions에서 실행 가능해야 한다.

### FR-10

Breaking change 발생 시:

-   PR 코멘트 자동 생성
-   PR 체크 실패(optional)
-   프론트 레포 이슈 생성(optional)

## 5. 비기능 요구사항 (Non-Functional)

-   Node.js 기반 CLI
-   JSON / YAML 입력 지원
-   PR 기준 실행 시간 5초 이내
-   Deterministic output

## 6. MVP 정의 (v0.1)

### 포함

-   OAS 3.0.x 가드
-   Canonicalization
-   Diff JSON 생성
-   Breaking Change 판별
-   **Semantic Versioning 자동 산출**
-   Markdown 리포트

### 제외

-   Storybook UI
-   프론트 레포 이슈 자동 생성

## 7. 성공 기준 (Success Criteria)

-   PR에서 API 변경의 **위험도 + 버전 영향**을 즉시 파악 가능
-   “이번 변경이 왜 major인지” 설명 가능
-   프론트엔드가 변경을 **사전에 인지**

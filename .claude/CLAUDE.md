# patchlogr - Claude Code Configuration

## Project Overview

**patchlogr**는 OpenAPI/OAS 스펙의 버전 간 변경사항을 자동으로 감지하고, Semantic Versioning(SemVer)에 따른 버전 범프를 권장하는 TypeScript 라이브러리입니다.

### 핵심 목적
- **API 변경 추적**: OpenAPI 2.0/3.0 문서의 breaking/non-breaking 변경사항 감지
- **자동 버전 권장**: 변경사항을 분석하여 major/minor/patch 버전 범프 제안
- **Changelog 생성**: API 변경사항을 구조화된 형태로 제공

### 주요 기능
1. **Canonicalization**: OpenAPI v2/v3를 통합된 정규화 형식으로 변환
2. **Partitioning**: API 스펙을 해시 기반 트리 구조로 파티셔닝
3. **Diff Detection**: 두 버전 간 차이점을 정확하게 비교
4. **Version Bump**: 변경사항의 영향도를 분석하여 SemVer 버전 권장

---

## Monorepo Architecture

### 패키지 구조 및 의존성

```
@patchlogr/types (기반 타입 레이어)
       ↑
       |
@patchlogr/oas (OpenAPI 전처리 & 정규화)
       ↑
       |
@patchlogr/core (핵심 비즈니스 로직)
       ↑
       |
@patchlogr/cli (사용자 인터페이스)
```

**Turbo monorepo** 구조로 관리되며, 모든 패키지는 workspace dependency로 연결됩니다.

### 패키지별 상세 역할

#### 1. `@patchlogr/types`
**위치**: `packages/patchlogr-types/`
**역할**: 프로젝트 전체에서 사용되는 공통 타입 정의

**주요 타입**:
- `CanonicalSpec`: 정규화된 OpenAPI 스펙 전체 구조
- `CanonicalOperation`: HTTP 메서드, 경로, 요청/응답 정보
- `CanonicalSchema`: JSON Schema/OAS Schema의 정규화 형태
- `CanonicalParam`, `CanonicalBody`, `CanonicalResponse`: 요청/응답 구성 요소
- `HTTPMethod`, `OperationKey`: 유틸리티 타입

**빌드 방식**: TypeScript 컴파일러만 사용 (타입 선언만 생성, esbuild 없음)

**주의사항**: 이 패키지의 타입 변경 시 전체 프로젝트 재빌드 필요

---

#### 2. `@patchlogr/oas`
**위치**: `packages/patchlogr-oas/`
**역할**: OpenAPI 문서를 정규화하고 전처리하는 파이프라인 제공

**핵심 기능**:
- **Pipeline Architecture**: 여러 단계를 순차적으로 실행
  - `OASBundleStage`: 외부 참조($ref)를 번들링
  - `OASValidationStage`: OpenAPI 스펙 유효성 검증
  - `OASDereferenceStage`: $ref 참조를 실제 객체로 역참조
  - `OASCanonicalizeStage`: 통합된 `CanonicalSpec` 형식으로 변환

- **Canonicalization 구현**:
  - OpenAPI v2 → CanonicalSpec (`src/canonicalize/v2/`)
  - OpenAPI v3 → CanonicalSpec (`src/canonicalize/v3/`)
  - 버전 차이를 추상화하여 일관된 데이터 구조 제공

**주요 Export**:
- `preprocessOASDocument(filePath, options)`: OpenAPI 문서 처리 메인 함수
- `OASStageOptions`: 파이프라인 옵션 (skipValidation 등)

**의존성**: `@patchlogr/types`, `@apidevtools/swagger-parser`

---

#### 3. `@patchlogr/core`
**위치**: `packages/patchlogr-core/`
**역할**: API 스펙 파티셔닝, 변경 감지, 버전 범프 계산 등 핵심 비즈니스 로직

**핵심 모듈**:

##### A. Partition (파티셔닝)
**목적**: `CanonicalSpec`을 해시 기반 트리 구조로 변환

**주요 함수**:
- `partitionByTag()`: 태그별로 operation 그룹화
- `partitionByMethod()`: HTTP 메서드별로 그룹화

**출력 구조**: `PartitionedSpec<K>`
- 루트 노드 해시
- `HashNode<K, V>` 맵: node(내부 노드) / leaf(리프 노드) 타입의 재귀적 트리

**파일**: `src/partition/partitionByTag.ts`, `src/partition/partitionByMethod.ts`

##### B. Diff (변경 감지)
**목적**: 두 `PartitionedSpec` 간 차이점을 비교하고 변경사항 추출

**알고리즘**:
- 재귀적 트리 순회 (`diffNode()`)
- 자식 노드 비교 (`diffChildNodes()`)
- 리프 노드 값 비교 (`diffLeafNodes()`)

**변경 타입**:
- `added`: 새로운 API operation 추가
- `removed`: 기존 API operation 삭제
- `modified`: 기존 API operation 수정
- `type_changed`: 노드 타입 변경 (구조적 변화)

**출력**: `SpecChangeSet<K>` (변경사항 배열 + 해시 정보)

**파일**: `src/diff/diffSpec.ts`, `src/diff/diffNode.ts`, `src/diff/diffChildNodes.ts`, `src/diff/diffLeafNodes.ts`

##### C. Version Bump Detection
**목적**: 변경사항을 분석하여 SemVer 버전 범프 권장

**분류 로직**:
- **major** (Breaking): `removed`, `type_changed`
- **minor** (New feature): `added`
- **patch** (Bug fix): `modified` (현재는 minor로 처리, 향후 세분화 필요)

**출력**: `VersionBumpResult`
- `recommendedBump`: "major" | "minor" | "patch"
- `isBreaking`: boolean
- `reasons`: 변경 이유 배열

**파일**: `src/diff/detectVersionBump.ts`, `src/diff/classifyChange.ts`

##### D. Storage (저장소 인터페이스)
**목적**: Content-Addressable Storage 인터페이스 정의

**상태**: 인터페이스만 정의됨 (구현체 미제공)
**파일**: `src/storage/ContentAddressableStorage.ts`

**의존성**: `@patchlogr/types`, `@patchlogr/oas`, `fast-json-stable-stringify`

---

#### 4. `@patchlogr/cli`
**위치**: `packages/patchlogr-cli/`
**역할**: 명령줄 인터페이스 제공

**주요 명령어**:
- `canonicalize <api-docs>`: OpenAPI 문서를 정규화
  - `--skipValidation`: 유효성 검증 스킵
  - `-o, --output <path>`: 출력 파일 경로

**구현**: `src/commands/canonicalize.ts`
**빌드 결과**: 실행 가능한 바이너리 (`dist/index.js`)

**의존성**: `@patchlogr/core`, `@patchlogr/oas`, `commander`

---

#### 5. `@patchlogr/inspector`
**위치**: `packages/patchlogr-inspector/`
**상태**: 개발 예정 (현재 빈 패키지)

---

## Data Flow

전체 데이터 처리 흐름:

```
1. OpenAPI Document (v2/v3)
         ↓
2. preprocessOASDocument() [@patchlogr/oas]
   - Bundle → Validate → Dereference → Canonicalize
         ↓
3. CanonicalSpec [@patchlogr/types]
   - Unified format for v2/v3
         ↓
4. partitionByTag/Method() [@patchlogr/core]
   - Convert to hash-based tree
         ↓
5. PartitionedSpec (Hash Tree)
   - HashNode<K, V> structure
         ↓
6. diffSpec() [@patchlogr/core]
   - Compare two versions
         ↓
7. SpecChangeSet
   - List of changes (added/removed/modified/type_changed)
         ↓
8. detectVersionBump() [@patchlogr/core]
   - Analyze impact
         ↓
9. VersionBumpResult
   - Recommended: major/minor/patch
   - Reasons: why this bump is needed
```

---

## Package Manager

**Yarn Berry (v4.12.0) with Plug'n'Play (PnP)** - DO NOT use npm or pnpm.

### 주요 특징
- **PnP 모드**: `node_modules` 없이 `.pnp.cjs`가 의존성 해결
- **Workspace**: `packages/*` 아래 모든 패키지 관리
- **Zero-installs**: `.yarn/cache` 커밋 가능 (현재는 gitignore)

### 필수 명령어
```bash
yarn                    # 의존성 설치
yarn add <pkg>          # 프로덕션 의존성 추가
yarn add -D <pkg>       # 개발 의존성 추가
yarn workspace <name> <cmd>  # 특정 패키지에서 명령 실행
```

### IDE 설정 (VSCode)
```bash
yarn dlx @yarnpkg/sdks vscode
```

### 주의사항
- **절대 npm/pnpm 사용 금지**
- 모듈 해결 에러 발생 시 `.yarnrc.yml`, `.pnp.cjs` 확인
- Workspace 의존성은 `"workspace:^"` 형식 사용

---

## Build & Test Commands

### Root-level (Turbo 통한 전체 패키지 실행)

```bash
yarn build          # 모든 패키지 빌드 (의존성 순서 보장)
yarn test           # 모든 테스트 실행
yarn test:coverage  # 커버리지 포함 테스트
yarn typecheck      # TypeScript 타입 체크
yarn lint           # ESLint 검사
yarn lint:fix       # ESLint 자동 수정
yarn clean          # 빌드 산출물 및 캐시 삭제
```

### Package-level (특정 패키지)

```bash
cd packages/patchlogr-core
yarn build          # 해당 패키지만 빌드
yarn test           # 해당 패키지만 테스트
yarn typecheck      # 해당 패키지만 타입 체크
```

**주의**: Package-level 명령은 Turbo 캐싱 없이 직접 실행됩니다.

---

## Build System

### Turbo (Monorepo Build Orchestration)

**설정 파일**: `turbo.json`

**핵심 기능**:
- **의존성 기반 빌드 순서**: `dependsOn: ["^build"]`로 패키지 빌드 순서 자동 관리
- **캐싱**: `.turbo/` 디렉토리에 빌드 결과 캐시
- **병렬 실행**: 의존성 없는 태스크는 병렬 실행

**캐시 전략**:
- 입력 파일 변경 시에만 재빌드
- `inputs`: 소스 코드, 설정 파일
- `outputs`: 빌드 산출물 (`dist/**`, `.coverage/**`)

### esbuild (JavaScript Bundler)

**예시 설정**: `packages/patchlogr-core/esbuild.mjs`

**출력 형식**:
- **ESM**: `dist/index.js` (import 사용)
- **CJS**: `dist/index.cjs` (require 사용)

**설정**:
- `platform: "node"`
- `target: "node18"`
- `format: ["esm", "cjs"]`
- `sourcemap: true`

### TypeScript

**Base 설정**: `tsconfig.base.json`

**주요 옵션**:
- `module: "NodeNext"`, `moduleResolution: "NodeNext"`
- `strict: true`, `noUncheckedIndexedAccess: true`
- `target: "ES2022"`
- `skipLibCheck: true` (성능 최적화)

**빌드 프로세스** (각 패키지):
```bash
yarn clean              # dist/ 삭제
yarn build:types        # tsc로 .d.ts 생성
yarn build:js           # esbuild로 .js/.cjs 생성
```

**예외**: `@patchlogr/types`는 `build:types`만 실행 (타입 전용 패키지)

---

## Testing

### Vitest

**설정 파일**: `vitest.config.ts` (루트)

**테스트 위치**: Co-located 테스트 구조
```
src/
  partition/
    __tests__/
      partitionByTag.test.ts
    partitionByTag.ts
```

**실행 명령**:
```bash
yarn test              # Watch 모드
yarn test:coverage     # 커버리지 리포트 생성
```

**커버리지 출력**:
- `.coverage/` 디렉토리
- Provider: v8
- 형식: HTML, JSON, LCOV

**리포터**:
- `default`: 콘솔 출력
- `junit`: CI 연동
- `json`, `html`: 상세 리포트

### 테스트 작성 가이드

```typescript
import { describe, it, expect } from 'vitest';
import { partitionByTag } from '../partitionByTag';

describe('partitionByTag', () => {
  it('should partition spec by tags', () => {
    // Given
    const spec = { /* ... */ };

    // When
    const result = partitionByTag(spec);

    // Then
    expect(result.rootHash).toBeDefined();
    expect(result.hashObjects.size).toBeGreaterThan(0);
  });
});
```

---

## Code Quality Pipeline

### 1. TypeScript (Type Safety)
```bash
yarn typecheck          # 타입 에러 확인
```
- 모든 패키지에서 타입 에러 0개여야 함
- `strict` 모드 활성화
- `noUncheckedIndexedAccess` 사용

### 2. ESLint + Prettier (Code Style)
```bash
yarn lint               # 린트 에러 확인
yarn lint:fix           # 자동 수정
```

**설정**:
- `@typescript-eslint/eslint-plugin`
- `eslint-plugin-prettier`
- `eslint-plugin-unused-imports`

**규칙**:
- Prettier와 통합
- Unused imports 자동 제거
- TypeScript 권장 규칙 적용

### 3. Vitest (Testing)
```bash
yarn test               # 모든 테스트 통과
yarn test:coverage      # 커버리지 확인
```

### 4. Build Validation
```bash
yarn build              # 모든 패키지 빌드 성공
```

---

## Git Workflow

### Git Flow Strategy

**브랜치 구조**:
- `main`: 프로덕션 릴리스 전용
- `develop`: 통합 브랜치 (기본 base)
- `feature/*`: 새로운 기능 (from develop)
- `hotfix/*`: 긴급 수정 (from main)
- `release/*`: 릴리스 준비 (from develop)

### 워크플로우

#### Feature 개발
```bash
# develop에서 feature 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/add-new-parser

# 작업 후 커밋
git add .
git commit -m "feat: add new OAS parser"

# develop으로 PR 생성
git push origin feature/add-new-parser
```

#### Hotfix
```bash
# main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/fix-critical-bug

# 수정 후 main + develop에 머지
```

### PR 규칙
- **기본 타겟**: `develop` (hotfix 제외)
- **리뷰 필수**: 최소 1명 이상
- **CI 통과**: 모든 테스트/린트/빌드 성공 필요

---

## Important Development Notes

### 1. 패키지 의존성 변경 시
```bash
# 의존성 추가/수정 후 전체 재빌드 필수
yarn build
```
- Turbo가 변경사항을 감지하여 필요한 패키지만 재빌드
- `@patchlogr/types` 변경 시 모든 패키지 재빌드됨

### 2. Co-located 테스트 구조
- 테스트 파일은 `src/**/__tests__/` 안에 위치
- 별도의 `test/` 디렉토리 없음
- 장점: 소스 코드와 테스트 코드 근접 배치

### 3. Yarn Berry PnP 주의사항
- `node_modules` 폴더가 없음 (일부 도구용 제외)
- `.pnp.cjs` 파일이 모듈 해결 담당
- IDE 설정 필요: `yarn dlx @yarnpkg/sdks vscode`
- 일부 네이티브 모듈과 호환성 문제 가능

### 4. Turbo 캐싱
- `.turbo/` 디렉토리에 빌드 캐시 저장
- 문제 발생 시 캐시 삭제: `yarn clean`
- CI에서는 원격 캐싱 설정 가능

### 5. 순차 빌드 보장
- `types` → `oas` → `core` → `cli` 순서로 빌드
- Turbo의 `dependsOn`이 자동 처리
- 수동 빌드 시 순서 주의

### 6. ESM + CJS 동시 지원
- 모든 패키지가 dual format 출력
- `package.json`의 `exports` 필드로 구분
- Node.js 18+ 호환

### 7. Content-Addressable Storage
- 인터페이스만 정의됨 (`ContentAddressableStorage.ts`)
- 향후 Git-like 저장소 구현 예정
- 현재는 미사용 상태

---

## Architecture Decisions

### Pipeline Pattern (`@patchlogr/oas`)
**이유**: OpenAPI 처리를 단계별로 분리하여 각 단계의 책임 명확화

**장점**:
- 각 Stage를 독립적으로 테스트 가능
- 새로운 처리 단계 추가 용이
- 에러 처리 및 디버깅 단순화

### Hash-based Tree (`@patchlogr/core`)
**이유**: API operation을 효율적으로 비교하기 위한 구조

**장점**:
- Content-addressable: 동일한 내용은 동일한 해시
- 변경 감지 최적화: 해시만 비교하여 빠른 diff
- 재귀적 비교: 트리 구조로 계층적 변경 추적

### Canonicalization
**이유**: OpenAPI v2/v3 차이를 추상화

**장점**:
- 버전 무관한 로직 작성 가능
- Diff 알고리즘 단순화
- 새로운 OpenAPI 버전 지원 용이

---

## Before Committing

**필수 체크리스트** (순서대로 실행):

```bash
# 1. 코드 스타일 자동 수정
yarn lint:fix

# 2. 타입 안전성 확인
yarn typecheck

# 3. 테스트 통과 확인
yarn test

# 4. 빌드 성공 확인
yarn build
```

**모든 단계 통과 시에만 커밋**

### Pre-commit Hook (자동화)
`.claude/settings.json`에 설정된 경우 자동 실행:
```json
{
  "hooks": {
    "pre-commit": "yarn lint && yarn typecheck && yarn test"
  }
}
```

---

## Troubleshooting

### 모듈 해결 에러
```bash
# PnP 캐시 재생성
yarn install --force
```

### Turbo 캐시 문제
```bash
# 캐시 삭제 후 재빌드
yarn clean
yarn build
```

### TypeScript 에러 (타입 변경 후)
```bash
# 전체 재빌드
yarn clean
yarn build
```

### IDE에서 모듈 찾을 수 없음
```bash
# VSCode SDK 재설치
yarn dlx @yarnpkg/sdks vscode
```

---

## Resources

- **Turbo 문서**: https://turbo.build/repo/docs
- **Yarn Berry**: https://yarnpkg.com/
- **Vitest**: https://vitest.dev/
- **esbuild**: https://esbuild.github.io/
- **OpenAPI Spec**: https://swagger.io/specification/

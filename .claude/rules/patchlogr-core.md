---
paths:
  - "packages/patchlogr-core/**"
---

# @patchlogr/core

API 스펙 파티셔닝, 변경 감지, 버전 범프 계산 등 핵심 비즈니스 로직 패키지.

## Exported Functions

### Partition (해시 기반 트리 생성)

```typescript
// 태그별로 operation 그룹화
function partitionByTag(spec: CanonicalSpec): PartitionedSpec<string>;

// HTTP 메서드별로 그룹화
function partitionByMethod(spec: CanonicalSpec): PartitionedSpec<string>;

// 노드 생성 유틸리티
function createNode<K, V>(key: K, hash: string, children: HashNode<K, V>[]): HashNode<K, V>;
function createLeafNode<K, V>(key: K, hash: string, value: V): HashNode<K, V>;
function createHashedLeaf<K, V>(key: K, value: V): HashNode<K, V>;  // 자동 해시 생성
function createHashedNode<K, V>(key: K, children: HashNode<K, V>[]): HashNode<K, V>;  // 자동 해시 생성
```

### Diff (변경 감지) - 현재 내부 모듈, 향후 export 예정

```typescript
// 두 PartitionedSpec 비교
function diffSpec<K>(base: PartitionedSpec<K>, head: PartitionedSpec<K>): SpecChangeSet<K>;

// 버전 범프 권장
function detectVersionBump<K>(changeSet: SpecChangeSet<K>): VersionBumpResult;
```

## Exported Types

### Partition Types

```typescript
type Hash = string;

type HashNode<K = string, V = unknown> = {
    type: "node" | "leaf";
    key: K;
    hash: Hash;
    children?: HashNode<K, V>[];  // type: "node"일 때
    value?: V;                     // type: "leaf"일 때
};

type PartitionedSpec<K = string, V = unknown> = {
    root: HashNode<K, V>;
    metadata: Record<string, unknown>;
    hashObjects: HashObject<V>[];
};
```

### Diff Types (내부 모듈)

```typescript
type ChangeType = "added" | "removed" | "modified" | "type_changed";

type SpecChange<K = string> = {
    type: ChangeType;
    path: K[];
    key: K;
    baseHash?: string;
    headHash?: string;
    baseNodeType?: "node" | "leaf";
    headNodeType?: "node" | "leaf";
};

type SpecChangeSet<K = string> = {
    baseHash: string;
    headHash: string;
    changes: SpecChange<K>[];
};

type VersionBump = "major" | "minor" | "patch" | "none";

type VersionBumpResult = {
    recommendedBump: VersionBump;
    isBreaking: boolean;
    reasons: string[];
};
```

## 버전 범프 분류 기준

- **major** (Breaking): `removed`, `type_changed`
- **minor** (New feature): `added`
- **patch** (Bug fix): `modified` (현재는 minor로 처리)

## 의존성

- `@patchlogr/types`: CanonicalSpec 등 타입
- `@patchlogr/oas`: 전처리된 스펙 사용
- `fast-json-stable-stringify`: 결정적 해시 생성

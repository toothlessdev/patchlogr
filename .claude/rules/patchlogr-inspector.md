---
paths:
  - "packages/patchlogr-inspector/**"
---

# @patchlogr/inspector

## Overview

API 변경사항을 시각적으로 리뷰할 수 있는 웹 UI 도구. Storybook처럼 로컬에서 띄워서 사용.

## 핵심 기능

- **Diff 시각화**: `@patchlogr/core`의 diff 결과를 side-by-side 뷰로 표시
- **Breaking Change 강조**: Breaking change를 명확하게 표시
- **Operation별 상세 뷰**: Parameters, Request Body, Responses 탭으로 구분
- **변경 타입 표시**: Added (초록), Removed (빨강), Modified (파랑) 구분

## 패키지 구조

```
packages/patchlogr-inspector/
  client/    # React 기반 웹 UI
  server/    # diff 결과를 서빙하는 dev server
```

## 의존성

- `@patchlogr/core`: `SpecChangeSet`, `VersionBumpResult` 타입 소비
- `@patchlogr/types`: `CanonicalSpec`, `CanonicalOperation` 등 타입 참조

## 아키텍처 결정

### 모노레포 유지 (별도 레포 분리 X)

**이유**:
1. **타이트한 타입 의존성**: core의 diff 결과 타입에 직접 의존
2. **버전 동기화 필요**: core 변경 시 inspector도 함께 수정 필요
3. **개발 편의성**: core 수정 후 바로 inspector에서 확인 가능
4. **Storybook 패턴**: 메인 프로젝트와 같은 레포에서 관리하는 것이 일반적

## 개발 가이드

- client는 React + Vite 사용 예정
- server는 Express 또는 Fastify 기반 dev server
- TypeScript strict mode 유지

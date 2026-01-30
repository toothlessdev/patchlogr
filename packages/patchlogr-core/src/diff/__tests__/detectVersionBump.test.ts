import { describe, test, expect } from "vitest";
import { detectVersionBump } from "../detectVersionBump.js";
import type { SpecChangeSet } from "../diffChangeSet.js";

describe("detectVersionBump", () => {
    describe("none", () => {
        test("변경사항이 없으면 none을 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "abc",
                changes: [],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("none");
            expect(result.isBreaking).toBe(false);
            expect(result.reasons).toHaveLength(0);
        });
    });

    describe("major (breaking changes)", () => {
        test("removed 타입은 major를 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "removed",
                        path: [],
                        key: "GET /users",
                        baseHash: "hash1",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("major");
            expect(result.isBreaking).toBe(true);
            expect(result.reasons).toHaveLength(1);
        });

        test("type_changed는 major를 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "type_changed",
                        path: [],
                        key: "GET /users",
                        baseHash: "hash1",
                        headHash: "hash2",
                        baseNodeType: "leaf",
                        headNodeType: "node",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("major");
            expect(result.isBreaking).toBe(true);
            expect(result.reasons).toHaveLength(1);
        });
    });

    describe("minor", () => {
        test("added 타입은 minor를 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "added",
                        path: [],
                        key: "POST /users",
                        headHash: "hash1",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("minor");
            expect(result.isBreaking).toBe(false);
            expect(result.reasons).toHaveLength(1);
        });

        test("modified 타입은 minor를 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "modified",
                        path: [],
                        key: "GET /users",
                        baseHash: "hash1",
                        headHash: "hash2",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("minor");
            expect(result.isBreaking).toBe(false);
            expect(result.reasons).toHaveLength(1);
        });
    });

    describe("patch", () => {
        // TODO: Operation 내부 변경 분석 기능 추가 시 patch 케이스 개선 필요
        // (현재는 알 수 없는 ChangeType만 patch로 분류됨)
        test("알 수 없는 타입은 patch를 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "unknown" as any,
                        path: [],
                        key: "GET /users",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("patch");
            expect(result.isBreaking).toBe(false);
            expect(result.reasons).toHaveLength(1);
        });
    });

    describe("version bump 우선순위", () => {
        test("major > minor: major가 있으면 major를 반환한다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "added",
                        path: [],
                        key: "POST /users",
                        headHash: "hash1",
                    },
                    {
                        type: "removed",
                        path: [],
                        key: "DELETE /users",
                        baseHash: "hash2",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.recommendedBump).toBe("major");
            expect(result.isBreaking).toBe(true);
            expect(result.reasons).toHaveLength(2);
        });

        test("reasons에는 해당 레벨의 모든 변경 이유가 포함된다", () => {
            const changeSet: SpecChangeSet = {
                baseHash: "abc",
                headHash: "def",
                changes: [
                    {
                        type: "removed",
                        path: [],
                        key: "DELETE /users",
                        baseHash: "hash1",
                    },
                    {
                        type: "removed",
                        path: [],
                        key: "DELETE /posts",
                        baseHash: "hash2",
                    },
                ],
            };

            const result = detectVersionBump(changeSet);

            expect(result.reasons).toHaveLength(2);
        });
    });
});

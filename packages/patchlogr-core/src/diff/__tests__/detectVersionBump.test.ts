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
            expect(result.reasons).toContain("Removed:  > GET /users");
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
            expect(result.reasons).toContain("Added:  > POST /users");
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
            expect(result.reasons).toContain("Removed:  > DELETE /users");
            expect(result.reasons).toContain("Removed:  > DELETE /posts");
        });
    });
});

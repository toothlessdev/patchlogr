import { describe, expect, test } from "vitest";
import { diffChildNodes } from "../diffChildNodes";
import { createLeafNode, createNode } from "../../partition";

describe("diffChildNodes", () => {
    describe("removed detection (base에만 존재)", () => {
        test("base에만 있는 leaf child는 removed로 감지", () => {
            const removedChild = createLeafNode("onlyInBase", "hash-removed", {
                data: "old",
            });
            const sharedChild = createLeafNode("shared", "hash-shared", {
                data: "same",
            });

            const base = createNode("root", "hash-root-old", [
                removedChild,
                sharedChild,
            ]);
            const head = createNode("root", "hash-root-new", [sharedChild]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(1);
            expect(result.changes[0]).toMatchObject({
                type: "removed",
                key: "onlyInBase",
                baseHash: "hash-removed",
                baseNodeType: "leaf",
            });
            expect(result.changes[0]?.path).toEqual(["root", "onlyInBase"]);
        });

        test("base에만 있는 node child는 removed로 감지 (서브트리)", () => {
            const subtreeLeaf = createLeafNode("leaf", "hash-leaf", { v: 1 });
            const subtreeNode = createNode("subtree", "hash-subtree", [
                subtreeLeaf,
            ]);
            const sharedChild = createLeafNode("shared", "hash-shared", {
                v: 99,
            });

            const base = createNode("root", "hash-root-old", [
                subtreeNode,
                sharedChild,
            ]);
            const head = createNode("root", "hash-root-new", [sharedChild]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(1);
            expect(result.changes[0]).toMatchObject({
                type: "removed",
                key: "subtree",
                baseNodeType: "node",
            });
        });
    });

    describe("added detection (head에만 존재)", () => {
        test("head에만 있는 leaf child는 added로 감지", () => {
            const addedChild = createLeafNode("onlyInHead", "hash-added", {
                data: "new",
            });
            const sharedChild = createLeafNode("shared", "hash-shared", {
                data: "same",
            });

            const base = createNode("root", "hash-root-old", [sharedChild]);
            const head = createNode("root", "hash-root-new", [
                sharedChild,
                addedChild,
            ]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(1);
            expect(result.changes[0]).toMatchObject({
                type: "added",
                key: "onlyInHead",
                headHash: "hash-added",
                headNodeType: "leaf",
            });
            expect(result.changes[0]?.path).toEqual(["root", "onlyInHead"]);
        });

        test("head에만 있는 node child는 added로 감지 (서브트리)", () => {
            const subtreeLeaf = createLeafNode("leaf", "hash-leaf", { v: 1 });
            const subtreeNode = createNode("subtree", "hash-subtree", [
                subtreeLeaf,
            ]);
            const sharedChild = createLeafNode("shared", "hash-shared", {
                v: 99,
            });

            const base = createNode("root", "hash-root-old", [sharedChild]);
            const head = createNode("root", "hash-root-new", [
                subtreeNode,
                sharedChild,
            ]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(1);
            expect(result.changes[0]).toMatchObject({
                type: "added",
                key: "subtree",
                headNodeType: "node",
            });
        });
    });

    describe("modifiedPairs (공통 자식 중 hash가 다른 경우)", () => {
        test("공통 자식의 hash가 다르면 modifiedPairs에 포함", () => {
            const baseChild = createLeafNode("child", "hash-old", { v: 1 });
            const headChild = createLeafNode("child", "hash-new", { v: 2 });

            const base = createNode("root", "hash-root-old", [baseChild]);
            const head = createNode("root", "hash-root-new", [headChild]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(0); // added/removed 없음
            expect(result.modifiedPairs).toHaveLength(1);
            expect(result.modifiedPairs[0]?.base.key).toBe("child");
            expect(result.modifiedPairs[0]?.head.key).toBe("child");
        });

        test("공통 자식의 hash가 같으면 modifiedPairs에 포함되지 않음", () => {
            const sameChild = createLeafNode("child", "hash-same", { v: 1 });

            const base = createNode("root", "hash-root-old", [sameChild]);
            const head = createNode("root", "hash-root-new", [sameChild]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(0);
            expect(result.modifiedPairs).toHaveLength(0);
        });
    });

    describe("복합 시나리오", () => {
        test("added, removed, modified가 동시에 존재하는 경우", () => {
            const removedChild = createLeafNode("removed", "hash-rem", {
                v: 1,
            });
            const addedChild = createLeafNode("added", "hash-add", { v: 2 });
            const modifiedBase = createLeafNode("modified", "hash-mod-old", {
                v: 3,
            });
            const modifiedHead = createLeafNode("modified", "hash-mod-new", {
                v: 4,
            });

            const base = createNode("root", "hash-root-old", [
                removedChild,
                modifiedBase,
            ]);
            const head = createNode("root", "hash-root-new", [
                addedChild,
                modifiedHead,
            ]);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            const removedChanges = result.changes.filter(
                (c) => c.type === "removed",
            );
            const addedChanges = result.changes.filter(
                (c) => c.type === "added",
            );

            expect(removedChanges).toHaveLength(1);
            expect(removedChanges[0]?.key).toBe("removed");

            expect(addedChanges).toHaveLength(1);
            expect(addedChanges[0]?.key).toBe("added");

            expect(result.modifiedPairs).toHaveLength(1);
            expect(result.modifiedPairs[0]?.base.key).toBe("modified");
        });

        test("빈 children을 가진 node들 비교", () => {
            const base = createNode("root", "hash-old", []);
            const head = createNode("root", "hash-new", []);

            if (base.type !== "node" || head.type !== "node") {
                throw new Error("Expected node types");
            }

            const result = diffChildNodes(base, head, ["root"]);

            expect(result.changes).toHaveLength(0);
            expect(result.modifiedPairs).toHaveLength(0);
        });
    });
});

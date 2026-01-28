import { describe, expect, test } from "vitest";
import { diffNode } from "../diffNode.js";
import { createLeafNode, createNode } from "../../partition";

describe("diffNode", () => {
    test("base.hash === head.hash인 경우 changes는 빈 배열이어야 함", () => {
        const base = createLeafNode("key1", "hash123", { name: "Alice" });
        const head = createLeafNode("key1", "hash123", { name: "Alice" });

        const result = diffNode(base, head);

        expect(result.changes).toEqual([]);
        expect(result.baseHash).toBe("hash123");
        expect(result.headHash).toBe("hash123");
    });

    test("base와 head가 둘 다 leaf이고 hash가 다른 경우 modified 1건", () => {
        const base = createLeafNode("user", "hash-old", { name: "Alice" });
        const head = createLeafNode("user", "hash-new", {
            name: "Alice Updated",
        });

        const result = diffNode(base, head);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toMatchObject({
            type: "modified",
            key: "user",
            baseHash: "hash-old",
            headHash: "hash-new",
        });
    });

    test("둘 다 leaf인데 key가 동일하고 hash가 다른 경우 modified 1건 + value 포함", () => {
        const baseValue = { email: "old@test.com" };
        const headValue = { email: "new@test.com" };
        const base = createLeafNode("config", "hash-v1", baseValue);
        const head = createLeafNode("config", "hash-v2", headValue);

        const result = diffNode(base, head);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toMatchObject({
            type: "modified",
            key: "config",
            baseValue,
            headValue,
        });
    });

    test("base와 head가 둘 다 node이고 hash가 다른 경우 children을 key 기준으로 비교", () => {
        const baseChild = createLeafNode("child1", "hash-child-old", {
            v: 1,
        });
        const headChild = createLeafNode("child1", "hash-child-new", {
            v: 2,
        });
        const base = createNode("root", "hash-root-old", [baseChild]);
        const head = createNode("root", "hash-root-new", [headChild]);

        const result = diffNode(base, head);

        expect(result.changes.length).toBeGreaterThan(0);
        expect(result.changes.some((c) => c.type === "modified")).toBe(true);
    });

    test("base에만 있는 childKey가 존재하는 경우 removed 1건", () => {
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

        const result = diffNode(base, head);

        const removedChanges = result.changes.filter(
            (c) => c.type === "removed",
        );
        expect(removedChanges).toHaveLength(1);
        expect(removedChanges[0]).toMatchObject({
            type: "removed",
            key: "onlyInBase",
            baseHash: "hash-removed",
        });
        expect(removedChanges[0]?.headHash).toBeUndefined();
    });

    test("head에만 있는 childKey가 존재하는 경우 added 1건", () => {
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

        const result = diffNode(base, head);

        const addedChanges = result.changes.filter((c) => c.type === "added");
        expect(addedChanges).toHaveLength(1);
        expect(addedChanges[0]).toMatchObject({
            type: "added",
            key: "onlyInHead",
            headHash: "hash-added",
        });
        expect(addedChanges[0]?.baseHash).toBeUndefined();
    });

    test("base와 head 모두에 있는 childKey인데 child hash가 같은 경우 탐색하지 않음", () => {
        const sameChild = createLeafNode("unchanged", "hash-same", {
            data: "constant",
        });

        const base = createNode("root", "hash-root-old", [sameChild]);
        const head = createNode("root", "hash-root-new", [sameChild]);

        const result = diffNode(base, head);

        const childChanges = result.changes.filter(
            (c) => c.key === "unchanged",
        );
        expect(childChanges).toHaveLength(0);
    });

    test("base와 head 모두에 있는 childKey인데 child hash가 다른 경우 재귀", () => {
        const baseLeaf = createLeafNode("deepChild", "hash-deep-old", {
            v: 1,
        });
        const headLeaf = createLeafNode("deepChild", "hash-deep-new", {
            v: 2,
        });

        const baseMiddle = createNode("middle", "hash-mid-old", [baseLeaf]);
        const headMiddle = createNode("middle", "hash-mid-new", [headLeaf]);

        const base = createNode("root", "hash-root-old", [baseMiddle]);
        const head = createNode("root", "hash-root-new", [headMiddle]);

        const result = diffNode(base, head);

        const deepChange = result.changes.find((c) => c.key === "deepChild");
        expect(deepChange).toBeDefined();
        expect(deepChange?.type).toBe("modified");
    });

    test("base에만 있는 child가 node(subtree)인 경우 removed는 1건이어야 함", () => {
        const subtreeLeaf = createLeafNode("leaf", "hash-leaf", { v: 1 });
        const subtreeNode = createNode("subtree", "hash-subtree", [
            subtreeLeaf,
        ]);
        const sharedChild = createLeafNode("shared", "hash-shared", { v: 99 });

        const base = createNode("root", "hash-root-old", [
            subtreeNode,
            sharedChild,
        ]);
        const head = createNode("root", "hash-root-new", [sharedChild]);

        const result = diffNode(base, head);

        const removedChanges = result.changes.filter(
            (c) => c.type === "removed",
        );
        expect(removedChanges).toHaveLength(1);
        expect(removedChanges[0]).toMatchObject({
            type: "removed",
            key: "subtree",
            baseNodeType: "node",
        });
    });

    test("head에만 있는 child가 node(subtree)인 경우 added는 1건이어야 함", () => {
        const subtreeLeaf = createLeafNode("leaf", "hash-leaf", { v: 1 });
        const subtreeNode = createNode("subtree", "hash-subtree", [
            subtreeLeaf,
        ]);
        const sharedChild = createLeafNode("shared", "hash-shared", { v: 99 });

        const base = createNode("root", "hash-root-old", [sharedChild]);
        const head = createNode("root", "hash-root-new", [
            subtreeNode,
            sharedChild,
        ]);

        const result = diffNode(base, head);

        const addedChanges = result.changes.filter((c) => c.type === "added");
        expect(addedChanges).toHaveLength(1);
        expect(addedChanges[0]).toMatchObject({
            type: "added",
            key: "subtree",
            headNodeType: "node",
        });
    });

    test("base가 node이고 head가 leaf인 경우 type_changed 1건", () => {
        const child = createLeafNode("child", "hash-child", { v: 1 });
        const base = createNode<string, unknown>("target", "hash-node", [
            child,
        ]);
        const head = createLeafNode<string, unknown>("target", "hash-leaf", {
            v: "collapsed",
        });

        const result = diffNode(base, head);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toMatchObject({
            type: "type_changed",
            key: "target",
            baseNodeType: "node",
            headNodeType: "leaf",
            baseHash: "hash-node",
            headHash: "hash-leaf",
        });
    });

    test("D13: base가 leaf이고 head가 node인 경우 type_changed 1건", () => {
        const child = createLeafNode("child", "hash-child", { v: 1 });
        const base = createLeafNode<string, unknown>("target", "hash-leaf", {
            v: "simple",
        });
        const head = createNode<string, unknown>("target", "hash-node", [
            child,
        ]);

        const result = diffNode(base, head);

        expect(result.changes).toHaveLength(1);
        expect(result.changes[0]).toMatchObject({
            type: "type_changed",
            key: "target",
            baseNodeType: "leaf",
            headNodeType: "node",
            baseHash: "hash-leaf",
            headHash: "hash-node",
        });
    });
});

describe("Path / key 기록 규칙", () => {
    test("모든 change에는 path가 있어야 함 (root부터 변화 노드까지)", () => {
        const baseLeaf = createLeafNode("endpoint", "hash-old", {
            method: "GET",
        });
        const headLeaf = createLeafNode("endpoint", "hash-new", {
            method: "POST",
        });

        const baseTag = createNode("tag:User", "hash-tag-old", [baseLeaf]);
        const headTag = createNode("tag:User", "hash-tag-new", [headLeaf]);

        const base = createNode("root", "hash-root-old", [baseTag]);
        const head = createNode("root", "hash-root-new", [headTag]);

        const result = diffNode(base, head);

        const change = result.changes.find((c) => c.key === "endpoint");
        expect(change).toBeDefined();
        expect(change?.path).toEqual(["root", "tag:User", "endpoint"]);
    });

    test("change.key는 path의 마지막 요소와 동일해야 함", () => {
        const base = createLeafNode("myKey", "hash-old", { v: 1 });
        const head = createLeafNode("myKey", "hash-new", { v: 2 });

        const result = diffNode(base, head);

        for (const change of result.changes) {
            expect(change.key).toBe(change.path[change.path.length - 1]);
        }
    });

    test("동일한 path/key에 대해 change가 중복 생성되면 안 됨", () => {
        const baseLeaf = createLeafNode("item", "hash-old", { v: 1 });
        const headLeaf = createLeafNode("item", "hash-new", { v: 2 });

        const base = createNode("root", "hash-root-old", [baseLeaf]);
        const head = createNode("root", "hash-root-new", [headLeaf]);

        const result = diffNode(base, head);

        const pathStrings = result.changes.map((c) => c.path.join("/"));
        const uniquePaths = new Set(pathStrings);
        expect(pathStrings.length).toBe(uniquePaths.size);
    });

    test("baseHash/headHash 필드는 일관돼야 함", () => {
        const removed = createLeafNode("old", "hash-removed", { v: 1 });
        const added = createLeafNode("new", "hash-added", { v: 2 });
        const modifiedBase = createLeafNode("mod", "hash-mod-old", {
            v: 3,
        });
        const modifiedHead = createLeafNode("mod", "hash-mod-new", {
            v: 4,
        });

        const base = createNode("root", "hash-root-old", [
            removed,
            modifiedBase,
        ]);
        const head = createNode("root", "hash-root-new", [added, modifiedHead]);

        const result = diffNode(base, head);

        for (const change of result.changes) {
            if (change.type === "added") {
                expect(change.headHash).toBeDefined();
                expect(change.baseHash).toBeUndefined();
            } else if (change.type === "removed") {
                expect(change.baseHash).toBeDefined();
                expect(change.headHash).toBeUndefined();
            } else if (
                change.type === "modified" ||
                change.type === "type_changed"
            ) {
                expect(change.baseHash).toBeDefined();
                expect(change.headHash).toBeDefined();
            }
        }
    });
});

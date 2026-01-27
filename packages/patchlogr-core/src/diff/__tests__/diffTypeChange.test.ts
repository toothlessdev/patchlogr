import { describe, expect, test } from "vitest";
import { diffTypeChange } from "../diffTypeChange.js";
import { createLeafNode, createNode } from "../../partition/index.js";

describe("diffTypeChange", () => {
    test("node -> leaf 타입 변경 시 type_changed 생성", () => {
        const child = createLeafNode("child", "hash-child", { v: 1 });
        const base = createNode<string, unknown>("target", "hash-node", [
            child,
        ]);
        const head = createLeafNode<string, unknown>("target", "hash-leaf", {
            v: "collapsed",
        });

        const result = diffTypeChange(base, head, ["root", "target"]);

        expect(result.type).toBe("type_changed");
        expect(result.key).toBe("target");
        expect(result.baseNodeType).toBe("node");
        expect(result.headNodeType).toBe("leaf");
        expect(result.baseHash).toBe("hash-node");
        expect(result.headHash).toBe("hash-leaf");
    });

    test("leaf -> node 타입 변경 시 type_changed 생성", () => {
        const child = createLeafNode("child", "hash-child", { v: 1 });
        const base = createLeafNode<string, unknown>("target", "hash-leaf", {
            v: "simple",
        });
        const head = createNode<string, unknown>("target", "hash-node", [
            child,
        ]);

        const result = diffTypeChange(base, head, ["root", "target"]);

        expect(result.type).toBe("type_changed");
        expect(result.key).toBe("target");
        expect(result.baseNodeType).toBe("leaf");
        expect(result.headNodeType).toBe("node");
    });

    test("base가 leaf일 때 baseValue 포함", () => {
        const baseValue = { data: "original" };
        const base = createLeafNode<string, unknown>(
            "item",
            "hash-leaf",
            baseValue,
        );
        const head = createNode<string, unknown>("item", "hash-node", []);

        const result = diffTypeChange(base, head, ["root", "item"]);

        expect(result.baseValue).toEqual(baseValue);
        expect(result.headValue).toBeUndefined();
    });

    test("head가 leaf일 때 headValue 포함", () => {
        const headValue = { data: "collapsed" };
        const base = createNode<string, unknown>("item", "hash-node", []);
        const head = createLeafNode<string, unknown>(
            "item",
            "hash-leaf",
            headValue,
        );

        const result = diffTypeChange(base, head, ["root", "item"]);

        expect(result.baseValue).toBeUndefined();
        expect(result.headValue).toEqual(headValue);
    });

    test("양쪽 모두 leaf에서 다른 leaf일 때", () => {
        const baseValue = { v: 1 };
        const headValue = { v: 2 };
        const base = createLeafNode<string, unknown>(
            "item",
            "hash-old",
            baseValue,
        );
        const head = createLeafNode<string, unknown>(
            "item",
            "hash-new",
            headValue,
        );

        const result = diffTypeChange(base, head, ["root", "item"]);

        expect(result.type).toBe("type_changed");
        expect(result.baseNodeType).toBe("leaf");
        expect(result.headNodeType).toBe("leaf");
        expect(result.baseValue).toEqual(baseValue);
        expect(result.headValue).toEqual(headValue);
    });

    test("path는 전달받은 그대로 사용", () => {
        const base = createNode<string, unknown>("target", "hash-node", []);
        const head = createLeafNode<string, unknown>("target", "hash-leaf", {});

        const customPath = ["root", "level1", "target"];
        const result = diffTypeChange(base, head, customPath);

        expect(result.path).toEqual(customPath);
    });
});

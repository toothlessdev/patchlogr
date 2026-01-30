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

    test("path는 전달받은 그대로 사용", () => {
        const base = createNode<string, unknown>("target", "hash-node", []);
        const head = createLeafNode<string, unknown>("target", "hash-leaf", {});

        const customPath = ["root", "level1", "target"];
        const result = diffTypeChange(base, head, customPath);

        expect(result.path).toEqual(customPath);
    });
});

import { describe, expect, test } from "vitest";
import { diffLeafNodes } from "../diffLeafNodes.js";
import { createLeafNode } from "../../partition/index.js";

describe("diffLeafNodes", () => {
    test("두 leaf의 hash가 다른 경우 modified change 생성", () => {
        const base = createLeafNode("user", "hash-old", { name: "Alice" });
        const head = createLeafNode("user", "hash-new", { name: "Bob" });

        const result = diffLeafNodes(base, head, ["root", "user"]);

        expect(result.type).toBe("modified");
        expect(result.key).toBe("user");
        expect(result.baseHash).toBe("hash-old");
        expect(result.headHash).toBe("hash-new");
        expect(result.path).toEqual(["root", "user"]);
    });

    test("value가 있는 경우 baseValue, headValue 포함", () => {
        const baseValue = { email: "old@test.com" };
        const headValue = { email: "new@test.com" };
        const base = createLeafNode("config", "hash-v1", baseValue);
        const head = createLeafNode("config", "hash-v2", headValue);

        const result = diffLeafNodes(base, head, ["root", "config"]);

        expect(result.baseValue).toEqual(baseValue);
        expect(result.headValue).toEqual(headValue);
    });

    test("base에만 value가 있는 경우 baseValue만 포함", () => {
        const baseValue = { data: "old" };
        const base = createLeafNode("item", "hash-old", baseValue);
        const head = createLeafNode("item", "hash-new", undefined);

        const result = diffLeafNodes(base, head, ["root", "item"]);

        expect(result.baseValue).toEqual(baseValue);
        expect(result.headValue).toBeUndefined();
    });

    test("head에만 value가 있는 경우 headValue만 포함", () => {
        const headValue = { data: "new" };
        const base = createLeafNode("item", "hash-old", undefined);
        const head = createLeafNode("item", "hash-new", headValue);

        const result = diffLeafNodes(base, head, ["root", "item"]);

        expect(result.baseValue).toBeUndefined();
        expect(result.headValue).toEqual(headValue);
    });

    test("path는 전달받은 그대로 사용", () => {
        const base = createLeafNode("endpoint", "hash-a", { v: 1 });
        const head = createLeafNode("endpoint", "hash-b", { v: 2 });

        const customPath = ["root", "tag:User", "endpoint"];
        const result = diffLeafNodes(base, head, customPath);

        expect(result.path).toEqual(customPath);
    });
});

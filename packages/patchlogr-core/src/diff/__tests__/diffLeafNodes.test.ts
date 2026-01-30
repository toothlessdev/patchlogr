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

    test("path는 전달받은 그대로 사용", () => {
        const base = createLeafNode("endpoint", "hash-a", { v: 1 });
        const head = createLeafNode("endpoint", "hash-b", { v: 2 });

        const customPath = ["root", "tag:User", "endpoint"];
        const result = diffLeafNodes(base, head, customPath);

        expect(result.path).toEqual(customPath);
    });
});

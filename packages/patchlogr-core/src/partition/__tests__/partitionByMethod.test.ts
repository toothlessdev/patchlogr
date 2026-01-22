import type { CanonicalSpec } from "@patchlogr/types";
import { describe, expect, test } from "vitest";
import { partitionByMethod } from "../partitionByMethod";
import type { HashInternalNode } from "../partition";

describe("partitionByMethod", () => {
    test("should group by HTTPMethod", () => {
        const spec: CanonicalSpec = {
            operations: {
                "GET /user": {
                    key: "GET /user",
                    doc: { tags: ["user"] },
                    method: "GET",
                    path: "/user",
                    request: { params: [] },
                    responses: {},
                },
                "GET /user/{userId}": {
                    key: "GET /user/{userId}",
                    doc: { tags: ["user"] },
                    method: "GET",
                    path: "/user/{userId}",
                    request: { params: [] },
                    responses: {},
                },
            },
        };

        const result = partitionByMethod(spec);
        expect(result.root.type).toBe("node");
        expect(result.root.key).toBe("root");

        const root = result.root as HashInternalNode;
        expect(root.children).toHaveLength(1);

        const getMethodNode = root.children.find(
            (child) => child.key === "GET",
        ) as HashInternalNode;

        expect(getMethodNode).toBeDefined();
        expect(getMethodNode.type).toBe("node");
        expect(getMethodNode.children).toHaveLength(2);
        expect(getMethodNode.children[0]?.key).toBe("GET /user");
        expect(getMethodNode.children[1]?.key).toBe("GET /user/{userId}");
    });

    test("should group by multiple HTTPMethods", () => {
        const spec: CanonicalSpec = {
            operations: {
                "GET /user": {
                    key: "GET /user",
                    doc: { tags: ["user"] },
                    method: "GET",
                    path: "/user",
                    request: { params: [] },
                    responses: {},
                },
                "POST /auth/login": {
                    key: "POST /auth/login",
                    doc: { tags: ["auth"] },
                    method: "POST",
                    path: "/auth/login",
                    request: { params: [] },
                    responses: {},
                },
            },
        };

        const result = partitionByMethod(spec);
        expect(result.root.type).toBe("node");

        const root = result.root as HashInternalNode;
        expect(root.children).toHaveLength(2);

        const getMethodNode = root.children.find(
            (child) => child.key === "GET",
        ) as HashInternalNode;
        const postMethodNode = root.children.find(
            (child) => child.key === "POST",
        ) as HashInternalNode;

        expect(getMethodNode).toBeDefined();
        expect(postMethodNode).toBeDefined();

        expect(getMethodNode.children).toHaveLength(1);
        expect(getMethodNode.children[0]?.key).toBe("GET /user");

        expect(postMethodNode.children).toHaveLength(1);
        expect(postMethodNode.children[0]?.key).toBe("POST /auth/login");
    });
});

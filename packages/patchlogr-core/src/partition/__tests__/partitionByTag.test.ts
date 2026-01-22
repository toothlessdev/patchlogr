import type { CanonicalSpec } from "@patchlogr/types";
import { describe, expect, test } from "vitest";
import { DEFAULT_TAG, partitionByTag } from "../partitionByTag";
import { HashInternalNode } from "../partition";

describe("partitionByTag", () => {
    test("should group by first tag", () => {
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

        const result = partitionByTag(spec);
        expect(result.root.type).toBe("node");
        expect(result.root.key).toBe("root");

        const root = result.root as HashInternalNode;
        expect(root.children).toHaveLength(1);

        const userTagNode = root.children.find(
            (child) => child.key === "user",
        ) as HashInternalNode;

        expect(userTagNode.type).toBe("node");
        expect(userTagNode.children).toHaveLength(2);
        expect(userTagNode.children[0]?.key).toBe("GET /user");
        expect(userTagNode.children[1]?.key).toBe("GET /user/{userId}");
    });

    test("should group by multiple tags", () => {
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

        const result = partitionByTag(spec);
        expect(result.root.type).toBe("node");

        const root = result.root as HashInternalNode;
        expect(root.children).toHaveLength(2);

        const userTagNode = root.children.find(
            (child) => child.key === "user",
        ) as HashInternalNode;
        const authTagNode = root.children.find(
            (child) => child.key === "auth",
        ) as HashInternalNode;

        expect(userTagNode.children).toHaveLength(1);
        expect(userTagNode.children[0]?.key).toBe("GET /user");

        expect(authTagNode.children).toHaveLength(1);
        expect(authTagNode.children[0]?.key).toBe("POST /auth/login");
    });

    test("should group into default tag if tag not exists", () => {
        const spec: CanonicalSpec = {
            operations: {
                "GET /user": {
                    key: "GET /user",
                    doc: { tags: [] },
                    method: "GET",
                    path: "/user",
                    request: { params: [] },
                    responses: {},
                },
            },
        };

        const result = partitionByTag(spec);
        expect(result.root.type).toBe("node");

        const root = result.root as HashInternalNode;
        expect(root.children).toHaveLength(1);

        const defaultTagNode = root.children.find(
            (child) => child.key === DEFAULT_TAG,
        ) as HashInternalNode;

        expect(defaultTagNode.type).toBe("node");
        expect(defaultTagNode.children).toHaveLength(1);
        expect(defaultTagNode.children[0]?.key).toBe("GET /user");
    });
});

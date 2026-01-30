import type { CanonicalSpec } from "@patchlogr/types";
import { describe, expect, test } from "vitest";
import { DEFAULT_TAG, partitionByTag } from "../partitionByTag";

describe("partitionByTag", () => {
    test("첫 번째 tag를 기준으로 파티셔닝 한다", () => {
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

        const root = result.root;
        expect(root.children).toHaveLength(1);

        const userTagNode = root.children?.find(
            (child) => child.key === "user",
        );

        expect(userTagNode?.type).toBe("node");
        expect(userTagNode?.children).toHaveLength(2);
        expect(userTagNode?.children?.[0]?.key).toBe("GET /user");
        expect(userTagNode?.children?.[1]?.key).toBe("GET /user/{userId}");
    });

    test("여러 tag를 기준으로 파티셔닝 한다", () => {
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

        const root = result.root;
        expect(root.children).toHaveLength(2);

        const userTagNode = root.children?.find(
            (child) => child.key === "user",
        );
        const authTagNode = root.children?.find(
            (child) => child.key === "auth",
        );

        expect(userTagNode?.children).toHaveLength(1);
        expect(userTagNode?.children?.[0]?.key).toBe("GET /user");

        expect(authTagNode?.children).toHaveLength(1);
        expect(authTagNode?.children?.[0]?.key).toBe("POST /auth/login");
    });

    test("tag가 없는 경우 default tag로 파티셔닝 한다", () => {
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

        const root = result.root;
        expect(root.children).toHaveLength(1);

        const defaultTagNode = root.children?.find(
            (child) => child.key === DEFAULT_TAG,
        );

        expect(defaultTagNode?.type).toBe("node");
        expect(defaultTagNode?.children).toHaveLength(1);
        expect(defaultTagNode?.children?.[0]?.key).toBe("GET /user");
    });

    test("hashObjects를 리턴한다", () => {
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
                "POST /user": {
                    key: "POST /user",
                    doc: { tags: ["user"] },
                    method: "POST",
                    path: "/user",
                    request: { params: [] },
                    responses: {},
                },
            },
        };

        const result = partitionByTag(spec);

        expect(result.hashObjects).toBeDefined();
        expect(result.hashObjects).toHaveLength(2);
    });

    test("리프노드에는 value가 포함되지 않는다", () => {
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
            },
        };

        const result = partitionByTag(spec);
        const leafNode = result.root.children?.[0]?.children?.[0];

        expect(leafNode?.type).toBe("leaf");
        expect(leafNode?.hash).toBeDefined();
        expect(leafNode?.value).toBeUndefined();
    });

    test("hashObjects에 리프노드에 대한 CanonicalOperation 이 매핑된다", () => {
        const operation = {
            key: "GET /user" as const,
            doc: { tags: ["user"] },
            method: "GET" as const,
            path: "/user",
            request: { params: [] },
            responses: {},
        };

        const spec: CanonicalSpec = {
            operations: {
                "GET /user": operation,
            },
        };

        const result = partitionByTag(spec);
        const leafNode = result.root.children?.[0]?.children?.[0];
        const hashObject = result.hashObjects.find(
            (ho) => ho.hash === leafNode?.hash,
        );

        expect(hashObject).toBeDefined();
        expect(hashObject?.data).toEqual(operation);
    });
});

import type { CanonicalSpec } from "@patchlogr/types";
import { describe, expect, test } from "vitest";
import { partitionByMethod } from "../partitionByMethod";

describe("partitionByMethod", () => {
    test("HTTPMethod 를 기준으로 파티셔닝 한다", () => {
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

        const root = result.root;
        expect(root.children).toHaveLength(1);

        const getMethodNode = root.children?.find(
            (child) => child.key === "GET",
        );

        expect(getMethodNode).toBeDefined();
        expect(getMethodNode?.type).toBe("node");
        expect(getMethodNode?.children).toHaveLength(2);
        expect(getMethodNode?.children?.[0]?.key).toBe("GET /user");
        expect(getMethodNode?.children?.[1]?.key).toBe("GET /user/{userId}");
    });

    test("여러 HTTPMethod 를 기준으로 파티셔닝 한다", () => {
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

        const root = result.root;
        expect(root.children).toHaveLength(2);

        const getMethodNode = root.children?.find(
            (child) => child.key === "GET",
        );
        const postMethodNode = root.children?.find(
            (child) => child.key === "POST",
        );

        expect(getMethodNode).toBeDefined();
        expect(postMethodNode).toBeDefined();

        expect(getMethodNode?.children).toHaveLength(1);
        expect(getMethodNode?.children?.[0]?.key).toBe("GET /user");

        expect(postMethodNode?.children).toHaveLength(1);
        expect(postMethodNode?.children?.[0]?.key).toBe("POST /auth/login");
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

        const result = partitionByMethod(spec);

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

        const result = partitionByMethod(spec);
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

        const result = partitionByMethod(spec);
        const leafNode = result.root.children?.[0]?.children?.[0];
        const hashObject = result.hashObjects.find(
            (ho) => ho.hash === leafNode?.hash,
        );

        expect(hashObject).toBeDefined();
        expect(hashObject?.data).toEqual(operation);
    });
});

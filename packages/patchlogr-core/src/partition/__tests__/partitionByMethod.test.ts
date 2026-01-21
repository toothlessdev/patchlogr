import type { CanonicalSpec } from "@patchlogr/types";
import { describe, expect, test } from "vitest";
import { partitionByMethod } from "../partitionByMethod";

describe("partitionByMethod", () => {
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

        const partitions = partitionByMethod(spec).partitions;
        expect(partitions).toHaveLength(1);
        expect(partitions.get("GET")).toHaveLength(2);
        expect(partitions.get("GET")?.[0]?.operationKey).toBe("GET /user");
        expect(partitions.get("GET")?.[1]?.operationKey).toBe(
            "GET /user/{userId}",
        );
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

        const partitions = partitionByMethod(spec).partitions;

        expect(partitions).toHaveLength(2);
        expect(partitions.get("GET")).toHaveLength(1);
        expect(partitions.get("POST")).toHaveLength(1);
        expect(partitions.get("GET")?.[0]?.operationKey).toBe("GET /user");
        expect(partitions.get("POST")?.[0]?.operationKey).toBe(
            "POST /auth/login",
        );
    });
});

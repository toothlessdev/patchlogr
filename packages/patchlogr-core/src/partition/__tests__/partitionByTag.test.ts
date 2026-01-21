import type { CanonicalSpec } from "@patchlogr/types";
import { describe, expect, test } from "vitest";
import { DEFAULT_TAG, partitionByTag } from "../partitionByTag";

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

        const partitions = partitionByTag(spec).partitions;
        expect(partitions).toHaveLength(1);
        expect(partitions.get("user")).toHaveLength(2);
        expect(partitions.get("user")?.[0]?.operationKey).toBe("GET /user");
        expect(partitions.get("user")?.[1]?.operationKey).toBe(
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

        const partitions = partitionByTag(spec).partitions;

        expect(partitions).toHaveLength(2);
        expect(partitions.get("user")).toHaveLength(1);
        expect(partitions.get("auth")).toHaveLength(1);
        expect(partitions.get("user")?.[0]?.operationKey).toBe("GET /user");
        expect(partitions.get("auth")?.[0]?.operationKey).toBe(
            "POST /auth/login",
        );
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

        const partitions = partitionByTag(spec).partitions;

        expect(partitions).toHaveLength(1);
        expect(partitions.get(DEFAULT_TAG)).toHaveLength(1);
        expect(partitions.get(DEFAULT_TAG)?.[0]?.operationKey).toBe(
            "GET /user",
        );
    });
});

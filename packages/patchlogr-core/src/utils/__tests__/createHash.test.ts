import { describe, test, expect } from "vitest";
import { createSHA256Hash } from "../createHash";

describe("createHash", () => {
    describe("createSHA256Hash", () => {
        test("sha256 must be deterministic", () => {
            const hash = createSHA256Hash("test");
            expect(hash).toBe(createSHA256Hash("test"));
        });
    });
});

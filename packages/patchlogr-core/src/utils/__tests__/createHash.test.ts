import { describe, test, expect } from "vitest";
import { createSHA256Hash } from "../createHash";

describe("createHash", () => {
    describe("createSHA256Hash", () => {
        test("sha256 hash 는 동일한 입력에 대해 동일한 결과를 반환한다", () => {
            const hash = createSHA256Hash("test");
            expect(hash).toBe(createSHA256Hash("test"));
        });
    });
});

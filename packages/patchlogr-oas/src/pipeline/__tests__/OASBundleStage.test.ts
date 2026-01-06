import { describe, expect, test } from "vitest";
import { OASBundleStage } from "../OASBundleStage";
import { OASStageContext } from "../OASStageContext";
import path from "path";

describe("OASBundleStage", () => {
    test("should dereference external $ref correctly", async () => {
        const oasBundleStage = new OASBundleStage();

        const input: OASStageContext = {
            source: path.resolve(__dirname, "../../__fixtures__/base.json"),
        };

        const output = await oasBundleStage.execute(input);
        console.log(JSON.stringify(output.oas));
        expect(output.oas).not.toHaveProperty("$ref");
    });
});

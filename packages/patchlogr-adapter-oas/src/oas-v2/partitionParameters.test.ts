import { describe, expect, test } from "vitest";
import { partitionParameters } from "./partitionParameters";

describe("partitionParameters", () => {
    test("요청 파라미터, form data, body 파라미터를 분리한다", () => {
        const params = [
            { name: "id", in: "path", required: true, type: "string" },
            { name: "field", in: "formData", type: "string" },
            { name: "body", in: "body", schema: {} },
        ];
        const { requestParams, formDataParams, bodyParam } =
            partitionParameters(params);

        expect(requestParams).toHaveLength(1);
        expect(requestParams[0]?.name).toBe("id");
        expect(formDataParams).toHaveLength(1);
        expect(formDataParams[0]?.name).toBe("field");
        expect(bodyParam).toBeDefined();
    });
});

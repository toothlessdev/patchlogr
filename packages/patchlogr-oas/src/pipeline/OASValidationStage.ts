import SwaggerParser from "@apidevtools/swagger-parser";

import { PipelineStage } from "./PipelineExecutor";
import { OASStageContext } from "./OASStageContext";
import { getOASVersion } from "../utils/OASVersionUtils";

/**
 * OAS 문서의 유효성 검사
 */
export class OASValidationStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        if (!input.oas) {
            throw new Error(
                "OAS object is missing in context. A previous stage might have failed.",
            );
        }
        try {
            if (input.options?.skipValidation) {
                const oasVersion = getOASVersion(input.oas);
                if (!oasVersion) {
                    throw new Error(
                        "Could not determine OAS version from document",
                    );
                }
                return {
                    ...input,
                    oasVersion,
                };
            }

            const api = await SwaggerParser.validate(input.oas);
            const oasVersion = getOASVersion(api);

            if (!oasVersion) {
                throw new Error(`Invalid OpenAPI version: ${oasVersion}`);
            }

            return {
                ...input,
                oas: api,
                oasVersion,
            };
        } catch (err) {
            throw new Error(
                `Invalid OpenAPI Specification: ${(err as Error).message}`,
            );
        }
    }
}

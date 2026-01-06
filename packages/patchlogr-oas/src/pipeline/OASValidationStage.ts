import SwaggerParser from "@apidevtools/swagger-parser";

import { PipelineStage } from "./PipelineExecutor";
import { OASStageContext } from "./OASStageContext";
import { getOASVersion } from "../utils/OASVersionUtils";

export class OASValidationStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        try {
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

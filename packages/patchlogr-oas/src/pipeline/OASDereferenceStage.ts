import SwaggerParser from "@apidevtools/swagger-parser";
import { OASStageContext } from "./OASStageContext";
import { PipelineStage } from "./PipelineExecutor";

/**
 * OAS 문서의 모든 $ref를 평탄화함
 */
export class OASDereferenceStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        if (!input.oas) {
            throw new Error(
                "OAS object is missing in context. A previous stage might have failed.",
            );
        }
        const oas = await SwaggerParser.dereference(input.oas);

        return {
            ...input,
            oas,
        };
    }
}

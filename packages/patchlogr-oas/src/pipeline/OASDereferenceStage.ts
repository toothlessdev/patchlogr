import SwaggerParser from "@apidevtools/swagger-parser";
import { OASStageContext } from "./OASStageContext";
import { PipelineStage } from "./PipelineExecutor";

/**
 * OAS 문서의 모든 $ref를 평탄화함
 */
export class OASDereferenceStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        const oas = await SwaggerParser.dereference(input.oas || input.source);

        return {
            ...input,
            oas,
        };
    }
}

import SwaggerParser from "@apidevtools/swagger-parser";
import { OASStageContext } from "./OASStageContext";
import { PipelineStage } from "./PipelineExecutor";

/**
 * 외부 $ref, schema 를 포함한 모든 문서를 합침
 */
export class OASBundleStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        const api = await SwaggerParser.bundle(input.source);

        return {
            ...input,
            oas: api,
        };
    }
}

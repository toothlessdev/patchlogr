import SwaggerParser from "@apidevtools/swagger-parser";
import { OASStageContext } from "./OASStageContext";
import { PipelineStage } from "./PipelineExecutor";

export class OASBundleStage implements PipelineStage<OASStageContext> {
    async execute(input: OASStageContext): Promise<OASStageContext> {
        const api = await SwaggerParser.bundle(input.source);

        return {
            ...input,
            oas: api,
        };
    }
}

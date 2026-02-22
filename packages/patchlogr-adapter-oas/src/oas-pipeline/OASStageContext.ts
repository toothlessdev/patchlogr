import type { CanonicalSpec } from "@patchlogr/types";
import type { OpenAPI } from "openapi-types";

export type OASStageInput = string | OpenAPI.Document;

export type OASStageOptions = {
    skipValidation?: boolean;
};

export type OASStageContext = {
    source: OASStageInput;
    options?: OASStageOptions;
    oas?: OpenAPI.Document;
    oasVersion?: string;
    canonicalSpec?: CanonicalSpec;
    meta?: {
        version?: string;
    };
};

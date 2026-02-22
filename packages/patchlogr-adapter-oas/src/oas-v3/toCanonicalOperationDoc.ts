import type { CanonicalOperationDoc } from "@patchlogr/types";
import type { OpenAPIV3 } from "openapi-types";

/**
 * Operation에서 문서화용 메타데이터를 CanonicalOperationDoc으로 변환
 *
 * @example
 * const op = { operationId: "op1", summary: "summary" };
 * const meta = toCanonicalOperationDoc(op);
 * // Result: { operationId: "op1", summary: "summary" }
 */
export function toCanonicalOperationDoc(
    operation: OpenAPIV3.OperationObject,
): CanonicalOperationDoc {
    const docMetadata: CanonicalOperationDoc = {};
    if (operation.operationId) docMetadata.operationId = operation.operationId;
    if (operation.summary) docMetadata.summary = operation.summary;
    if (operation.description) docMetadata.description = operation.description;
    if (operation.tags) docMetadata.tags = operation.tags;

    return docMetadata;
}

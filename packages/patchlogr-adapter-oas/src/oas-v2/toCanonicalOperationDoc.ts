import type { CanonicalOperationDoc } from "@patchlogr/types";
import type { OpenAPIV2 } from "openapi-types";

/**
 * Operation에서 문서화용 메타데이터를 CanonicalOperationDoc으로 변환
 * @example
 * const operation = {
 *      operationId: "getUser",
 *      summary: "Get user",
 *      description: "Get user by ID",
 *      tags: ["User"],
 * };
 * const doc = toCanonicalOperationDoc(operation);
 */
export function toCanonicalOperationDoc(
    operation: OpenAPIV2.OperationObject,
): CanonicalOperationDoc {
    const docMetadata: CanonicalOperationDoc = {};
    if (operation.operationId !== undefined)
        docMetadata.operationId = operation.operationId;
    if (operation.summary !== undefined)
        docMetadata.summary = operation.summary;
    if (operation.description !== undefined)
        docMetadata.description = operation.description;
    if (operation.tags !== undefined) docMetadata.tags = operation.tags;

    return docMetadata;
}

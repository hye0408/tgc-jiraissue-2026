import {
  attachFilesToIssue,
  createJiraIssue,
  errorResponse,
  extractUploadedFiles,
  getStringField,
  jsonResponse,
} from "./shared/core.mjs";

export default async (req) => {
  try {
    const formData = await req.formData();
    const draftsJson = getStringField(formData, "drafts_json");
    if (!draftsJson) {
      return errorResponse("등록할 이슈 초안이 없습니다. 먼저 초안을 생성해 주세요.");
    }

    let draftPayloads;
    try {
      draftPayloads = JSON.parse(draftsJson);
    } catch {
      return errorResponse("이슈 초안 형식이 올바르지 않습니다.");
    }

    if (!Array.isArray(draftPayloads) || !draftPayloads.length) {
      return errorResponse("등록할 이슈 초안이 없습니다.");
    }

    const files = extractUploadedFiles(formData, "images");
    const results = [];
    const errors = [];
    const warnings = [];

    for (let index = 0; index < draftPayloads.length; index += 1) {
      const payload = draftPayloads[index];
      try {
        const draft = normalizeDraftPayload(payload);
        const createdIssue = await createJiraIssue(draft);

        let attachmentUploaded = true;
        if (files.length) {
          try {
            await attachFilesToIssue(createdIssue.key, files);
          } catch (error) {
            attachmentUploaded = false;
            warnings.push(
              `${createdIssue.key} 이슈는 생성되었지만 첨부파일 업로드는 실패했습니다. 사유: ${error.message}`,
            );
          }
        }

        results.push({
          key: createdIssue.key,
          url: createdIssue.url,
          summary: draft.summary,
          report_kind: draft.report_kind,
          category: draft.category,
          severity: draft.severity,
          customer_name: draft.customer_name,
          voc_type: draft.voc_type,
          body_markdown: draft.body_markdown,
          attachment_uploaded: attachmentUploaded,
        });
      } catch (error) {
        errors.push(`${index + 1}번째 초안 Jira 등록 실패: ${error.message}`);
      }
    }

    if (!results.length) {
      return jsonResponse({ results: [], errors, warnings }, 502);
    }

    return jsonResponse({ results, errors, warnings });
  } catch (error) {
    return errorResponse(error.message || "Jira 등록 중 오류가 발생했습니다.", 500);
  }
};

export const config = {
  path: "/api/issues",
  method: "POST",
};

function normalizeDraftPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("초안 데이터 형식이 올바르지 않습니다.");
  }

  const requiredFields = [
    "summary",
    "body_markdown",
    "report_kind",
    "category",
    "severity",
    "customer_name",
    "voc_type",
  ];

  const normalized = {};
  for (const fieldName of requiredFields) {
    const value = String(payload[fieldName] ?? "").trim();
    if (!value) {
      throw new Error(`\`${fieldName}\` 값이 비어 있습니다.`);
    }
    normalized[fieldName] = value;
  }

  return normalized;
}

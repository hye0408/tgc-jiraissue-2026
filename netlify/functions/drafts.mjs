import {
  createIssueDrafts,
  errorResponse,
  extractUploadedFiles,
  getStringField,
  jsonResponse,
} from "./shared/core.mjs";

export default async (req) => {
  try {
    const formData = await req.formData();
    const drafts = await createIssueDrafts({
      memo: getStringField(formData, "memo"),
      customerName: getStringField(formData, "customer_name"),
      category: getStringField(formData, "category", "자동 분류"),
      vocType: getStringField(formData, "voc_type", "자동 분류"),
      severity: getStringField(formData, "severity", "자동 판단"),
      files: extractUploadedFiles(formData, "images"),
    });

    return jsonResponse({ drafts });
  } catch (error) {
    return errorResponse(error.message || "초안 생성 중 오류가 발생했습니다.", 400);
  }
};

export const config = {
  path: "/api/drafts",
  method: "POST",
};

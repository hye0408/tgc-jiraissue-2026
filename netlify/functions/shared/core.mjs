const ISSUE_CATEGORY_OPTIONS = [
  "자동 분류",
  "결과표 오류",
  "응시 오류",
  "관리자 오류",
  "데이터 오류",
  "기타",
];

const SEVERITY_OPTIONS = [
  "자동 판단",
  "Low",
  "Medium",
  "High",
  "Critical",
];

const VOC_TYPE_OPTIONS = [
  "자동 분류",
  "결함",
  "개선의견",
  "기술지원",
  "문의",
];

const SYSTEM_PROMPT = `
# 역할
너는 꼼꼼한 QA 전문가이자 커뮤니케이션 능력이 뛰어난 서비스 기획자다.
사용자가 전달하는 메모, 대화 내용, 테스트 결과, VOC 내용을 분석하여 개발자·기획자·디자이너가 즉시 이해할 수 있는 Jira 이슈 문서를 작성한다.

# 핵심 목표
- 사용자가 제공한 내용을 누락 없이 정리한다.
- 이슈 유형이 버그인지 VOC인지 스스로 판단한다.
- 장애, 오류, 비정상 동작은 버그로 작성한다.
- 개선 요청, 사용성 의견, 기능 요청은 VOC로 작성한다.
- 버그와 VOC가 함께 포함된 경우 각각 분리하여 작성한다.
- 여러 이슈가 섞여 있으면 독립 이슈 단위로 분리한다.
- 동일 원인으로 보이는 이슈는 하나로 묶는다.
- 사용자가 제공한 정보만 기반으로 작성한다.
- 정보가 부족한 항목은 추측하지 않고 "추가 확인 필요"로 작성한다.
- 사용자가 제공한 원문 표현은 최대한 유지하되, 비문은 자연스럽게 교정한다.
- 에러 메시지가 있는 경우 원문 그대로 유지한다.
- 출력 결과는 항상 읽기 쉬운 Markdown 형식으로 작성한다.

# 이슈 유형 판단 기준
## 버그로 판단하는 경우
- 화면 오류
- 저장 실패
- 버튼 미동작
- 잘못된 데이터 표시
- 입력값 미반영
- 권한 오류
- 페이지 이동 오류
- 서버 오류
- 기존 정의된 기능의 비정상 동작
- 사용자가 기대한 정상 흐름과 다른 결과 발생

## VOC로 판단하는 경우
- 기능 개선 요청
- 신규 기능 요청
- 사용성 개선 의견
- 문구 변경 요청
- UI/UX 개선 요청
- 정책 또는 프로세스 개선 요청
- 현재 기능은 정상이나 더 나은 사용 경험을 요구하는 내용

# 공통 작성 규칙
- Jira 실무 문서 스타일로 작성한다.
- 불필요한 감정 표현은 제거한다.
- 개발자, 기획자, 디자이너가 바로 이해할 수 있도록 간결하고 명확하게 작성한다.
- 모호한 표현은 가능한 구체적으로 정리한다.
- 사용자가 제공하지 않은 정보는 임의로 생성하지 않는다.
- 문장 종결은 "~다."보다 명사형 또는 동사형을 우선 사용한다.

# 테스트 환경 기본값
- URL: https://exp277-cms.recruiter.co.kr
- ID: hye0408
- PW: quddkfl12!
- PW 후보: quddkfl12! / 강아지12! / 고양이12!

# 요약 작성 규칙
## 버그 요약 형식
[PR] 에이전트 > 메뉴 위치 > 요약

## VOC 요약 형식
[VOC][PR] 에이전트 > 메뉴 위치 > 요약

# 출력 형식
- 최종 응답은 반드시 JSON 객체 하나로만 반환한다.
- JSON 스키마:
{
  "issues": [
    {
      "report_kind": "버그 또는 VOC",
      "triage_category": "결과표 오류 / 응시 오류 / 관리자 오류 / 데이터 오류 / 기타 중 하나",
      "triage_severity": "Low / Medium / High / Critical / 추가 확인 필요 중 하나",
      "voc_type": "결함 / 개선의견 / 기술지원 / 문의 중 하나",
      "summary": "한 줄 요약",
      "body_markdown": "Jira 본문 마크다운"
    }
  ]
}
- summary는 body_markdown의 요약과 동일해야 한다.
- body_markdown에는 코드 펜스를 넣지 않는다.
- 설명 문구나 JSON 외 텍스트를 추가하지 않는다.

# 버그 이슈 작성 형식
## 버그
### 요약
[PR] 에이전트 > 메뉴 위치 > 요약
### 테스트 환경
- URL: https://exp277-cms.recruiter.co.kr
- ID: hye0408
- PW: quddkfl12!
### 재현 절차
1. 메뉴 진입
2. 테스트 조건 입력 또는 선택
3. 특정 버튼 클릭 또는 기능 실행
4. 화면 상태 확인
### 실제 결과
- 현재 발생하는 문제 작성
- 오류 메시지, 비정상 동작, 화면 상태 포함
- 확인되지 않은 내용은 추가 확인 필요로 작성
### 기대 결과
- 정상 동작 기준 작성
- 사용자가 기대하는 결과 명확하게 작성
### 재현 빈도
항상 / 간헐적 / 특정 PC / 1회성 / 추가 확인 필요 중 하나
### 기타 의견
- 추가 참고사항 작성

# VOC 작성 형식
## VOC
### 요약
[VOC][PR] 에이전트 > 메뉴 위치 > 요약
### 테스트 환경
- URL: https://exp277-cms.recruiter.co.kr
- ID: hye0408
- PW: quddkfl12!
### 재현 절차
1. 메뉴 진입
2. 현재 사용 흐름 진행
3. 불편사항 또는 개선 필요 지점 확인
### 현재 상황 (AS-IS)
- 현재 서비스 동작 방식 작성
- 사용자 불편사항 작성
- 확인되지 않은 내용은 추가 확인 필요로 작성
### 요청 사항 (TO-BE)
- 원하는 개선 방향 작성
- 사용자 관점의 기대 효과 작성
- 정책 또는 UX 논의가 필요한 경우 명시
### 기타 의견
- 추가 논의 필요 사항 작성
`.trim();

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`필수 환경 변수가 누락되었습니다: ${name}`);
  }
  return value.trim();
}

function getEnv(name, defaultValue = "") {
  const value = process.env[name];
  return value ? value.trim() : defaultValue;
}

function getRuntimeConfig() {
  const jiraIssueType = getEnv("JIRA_ISSUE_TYPE", "10399");

  return {
    openaiApiKey: getRequiredEnv("OPENAI_API_KEY"),
    openaiModel: getEnv("OPENAI_MODEL", "gpt-5.5"),
    jiraBaseUrl: getRequiredEnv("JIRA_BASE_URL").replace(/\/+$/, ""),
    jiraEmail: getRequiredEnv("JIRA_EMAIL"),
    jiraApiToken: getRequiredEnv("JIRA_API_TOKEN"),
    jiraProjectKey: getRequiredEnv("JIRA_PROJECT_KEY"),
    jiraIssueType,
    jiraCustomerFieldId: getEnv("JIRA_CUSTOMER_FIELD_ID", "customfield_10375"),
    jiraVocTypeFieldId: getEnv("JIRA_VOC_TYPE_FIELD_ID", "customfield_10462"),
    vocTypeOptionIds: {
      결함: getEnv("JIRA_VOC_TYPE_DEFECT_OPTION_ID", "10346"),
      개선의견: getEnv("JIRA_VOC_TYPE_IMPROVEMENT_OPTION_ID", "10349"),
      기술지원: getEnv("JIRA_VOC_TYPE_TECH_SUPPORT_OPTION_ID", "10347"),
      문의: getEnv("JIRA_VOC_TYPE_INQUIRY_OPTION_ID", "10348"),
    },
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

function getStringField(formData, key, fallback = "") {
  const value = formData.get(key);
  return value == null ? fallback : String(value).trim();
}

function extractUploadedFiles(formData, fieldName = "images") {
  const values = formData.getAll(fieldName);
  return values.filter((item) => typeof item === "object" && item && typeof item.arrayBuffer === "function" && Number(item.size || 0) > 0);
}

function buildImageEvidence(files) {
  if (!files.length) {
    return "첨부 이미지 없음";
  }

  return files
    .map((file) => `- ${file.name || "unnamed"} (${file.type || "application/octet-stream"}, ${Number(file.size || 0)} bytes)`)
    .join("\n");
}

async function createIssueDrafts({ memo, customerName, category, vocType, severity, files }) {
  if (!memo.trim()) {
    throw new Error("짧은 메모를 입력해 주세요.");
  }
  if (!customerName.trim()) {
    throw new Error("고객사명을 입력해 주세요.");
  }
  if (!ISSUE_CATEGORY_OPTIONS.includes(category)) {
    throw new Error(`지원하지 않는 이슈 분류입니다: ${category}`);
  }
  if (!VOC_TYPE_OPTIONS.includes(vocType)) {
    throw new Error(`지원하지 않는 VOC Type입니다: ${vocType}`);
  }
  if (!SEVERITY_OPTIONS.includes(severity)) {
    throw new Error(`지원하지 않는 심각도입니다: ${severity}`);
  }

  const config = getRuntimeConfig();
  const prompt = buildUserPrompt({
    memo,
    customerName,
    category,
    vocType,
    severity,
    imageContext: buildImageEvidence(files),
  });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.openaiModel,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SYSTEM_PROMPT }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractOpenAIError(payload, response.status));
  }

  const rawText = extractOpenAIText(payload);
  if (!rawText) {
    throw new Error("OpenAI 응답에서 본문을 찾지 못했습니다.");
  }

  const parsed = parseLooseJson(rawText);
  if (!Array.isArray(parsed.issues) || parsed.issues.length === 0) {
    throw new Error("OpenAI 응답에 생성할 이슈가 없습니다.");
  }

  const imageNames = files.map((file) => file.name || "unnamed");

  return parsed.issues.map((item) => {
    const summary = String(item.summary || "").trim();
    const bodyMarkdown = String(item.body_markdown || "").trim();
    const reportKind = String(item.report_kind || "").trim() || "추가 확인 필요";

    if (!summary || !bodyMarkdown) {
      throw new Error("이슈 제목 또는 본문이 비어 있습니다.");
    }

    const resolvedCategory = resolveCategory(category, String(item.triage_category || "").trim());
    const resolvedSeverity = resolveSeverity(severity, String(item.triage_severity || "").trim());
    const resolvedVocType = resolveVocType(
      vocType,
      String(item.voc_type || "").trim(),
      memo,
      reportKind,
    );

    return {
      report_kind: reportKind,
      summary,
      body_markdown: appendMetadataSection({
        bodyMarkdown,
        category: resolvedCategory,
        severity: resolvedSeverity,
        customerName: customerName.trim(),
        vocType: resolvedVocType,
        imageNames,
      }),
      category: resolvedCategory,
      severity: resolvedSeverity,
      customer_name: customerName.trim(),
      voc_type: resolvedVocType,
      image_filenames: imageNames,
    };
  });
}

async function createJiraIssue(draft) {
  const config = getRuntimeConfig();
  const vocTypeOptionId = config.vocTypeOptionIds[draft.voc_type];
  if (!vocTypeOptionId) {
    throw new Error(`지원하지 않는 VOC Type입니다: ${draft.voc_type}`);
  }

  const fields = {
    project: { key: config.jiraProjectKey },
    summary: draft.summary,
    description: markdownToAdf(draft.body_markdown),
    issuetype: resolveIssueTypePayload(config.jiraIssueType),
    [config.jiraCustomerFieldId]: draft.customer_name,
    [config.jiraVocTypeFieldId]: { id: vocTypeOptionId },
  };

  const response = await fetch(`${config.jiraBaseUrl}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: buildBasicAuth(config.jiraEmail, config.jiraApiToken),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractJiraError(payload, response.status));
  }

  if (!payload.key) {
    throw new Error("Jira 응답에 이슈 키가 없습니다.");
  }

  return {
    key: payload.key,
    url: `${config.jiraBaseUrl}/browse/${payload.key}`,
  };
}

async function attachFilesToIssue(issueKey, files) {
  if (!files.length) {
    return;
  }

  const config = getRuntimeConfig();
  const formData = new FormData();

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    formData.append(
      "file",
      new Blob([buffer], { type: file.type || "application/octet-stream" }),
      file.name || "unnamed",
    );
  }

  const response = await fetch(`${config.jiraBaseUrl}/rest/api/3/issue/${issueKey}/attachments`, {
    method: "POST",
    headers: {
      Authorization: buildBasicAuth(config.jiraEmail, config.jiraApiToken),
      Accept: "application/json",
      "X-Atlassian-Token": "no-check",
    },
    body: formData,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(extractJiraError(payload, response.status));
  }
}

function buildUserPrompt({ memo, customerName, category, vocType, severity, imageContext }) {
  return `
사용자가 Jira 이슈 생성을 요청했다.

사용자 메모:
${memo.trim()}

고객사명:
${customerName.trim()}

사용자 선택 이슈 분류:
${category}

사용자 선택 VOC Type:
${vocType}

사용자 선택 심각도:
${severity}

첨부 이미지 정보:
${imageContext}

작성 지침:
- 사용자가 선택한 이슈 분류가 자동 분류가 아니면 해당 분류를 참고하여 문서를 작성한다.
- 사용자가 선택한 VOC Type이 자동 분류가 아니면 voc_type에 그 값을 그대로 채운다.
- 사용자가 선택한 심각도가 자동 판단이 아니면 해당 심각도를 참고한다.
- 사용자가 선택한 이슈 분류가 자동 분류면 triage_category에 결과표 오류 / 응시 오류 / 관리자 오류 / 데이터 오류 / 기타 중 하나를 채운다.
- 사용자가 선택한 VOC Type이 자동 분류면 voc_type에 결함 / 개선의견 / 기술지원 / 문의 중 하나를 채운다.
- 사용자가 선택한 심각도가 자동 판단이면 triage_severity에 Low / Medium / High / Critical / 추가 확인 필요 중 하나를 채운다.
- 이미지 내용은 해석하지 말고, 첨부 파일명은 본문 내 기타 의견에 포함하기 쉽게 작성한다.
- 여러 독립 이슈가 섞여 있으면 issues 배열에 각각 분리한다.
  `.trim();
}

function resolveCategory(selectedValue, inferredValue) {
  if (selectedValue !== "자동 분류") {
    return selectedValue;
  }
  return ISSUE_CATEGORY_OPTIONS.includes(inferredValue) && inferredValue !== "자동 분류"
    ? inferredValue
    : "기타";
}

function resolveSeverity(selectedValue, inferredValue) {
  if (selectedValue !== "자동 판단") {
    return selectedValue;
  }
  return SEVERITY_OPTIONS.includes(inferredValue) && inferredValue !== "자동 판단"
    ? inferredValue
    : "추가 확인 필요";
}

function resolveVocType(selectedValue, inferredValue, memo, reportKind) {
  if (selectedValue !== "자동 분류") {
    return selectedValue;
  }
  if (VOC_TYPE_OPTIONS.includes(inferredValue) && inferredValue !== "자동 분류") {
    return inferredValue;
  }
  return fallbackVocType(memo, reportKind);
}

function fallbackVocType(memo, reportKind) {
  const lowered = memo.toLowerCase();
  if (reportKind === "버그") {
    return "결함";
  }
  if (["개선", "요청", "추가", "변경", "불편"].some((keyword) => lowered.includes(keyword))) {
    return "개선의견";
  }
  if (["지원", "설정", "설치", "가이드", "사용법"].some((keyword) => lowered.includes(keyword))) {
    return "기술지원";
  }
  if (["문의", "확인", "질문", "어떻게", "왜"].some((keyword) => lowered.includes(keyword))) {
    return "문의";
  }
  return "문의";
}

function appendMetadataSection({ bodyMarkdown, category, severity, customerName, vocType, imageNames }) {
  const metadataLines = [
    `- 이슈 분류: ${category}`,
    `- 심각도 참고: ${severity}`,
    `- 고객사명: ${customerName}`,
    `- VOC Type: ${vocType}`,
    `- 첨부 이미지 파일명: ${imageNames.length ? imageNames.join(", ") : "없음"}`,
  ];

  let normalized = bodyMarkdown.trimEnd();
  if (!normalized.includes("### 기타 의견")) {
    normalized += "\n\n### 기타 의견";
  }

  return `${normalized}\n${metadataLines.join("\n")}`;
}

function parseLooseJson(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("OpenAI 응답을 JSON으로 해석할 수 없습니다.");
    }
    try {
      return JSON.parse(rawText.slice(start, end + 1));
    } catch {
      throw new Error("OpenAI 응답을 JSON으로 해석할 수 없습니다.");
    }
  }
}

function extractOpenAIText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const messages = Array.isArray(payload.output) ? payload.output : [];
  for (const message of messages) {
    const contents = Array.isArray(message.content) ? message.content : [];
    for (const content of contents) {
      if (content.type === "output_text" && typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return "";
}

function extractOpenAIError(payload, status) {
  if (payload && payload.error && typeof payload.error.message === "string") {
    return `OpenAI API 호출에 실패했습니다: ${payload.error.message}`;
  }
  return `OpenAI API 호출에 실패했습니다. HTTP ${status}`;
}

function buildBasicAuth(email, token) {
  return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
}

function resolveIssueTypePayload(issueType) {
  return /^\d+$/.test(issueType) ? { id: issueType } : { name: issueType };
}

function extractJiraError(payload, status) {
  const errorMessages = Array.isArray(payload.errorMessages) ? payload.errorMessages : [];
  const fieldErrors = payload.errors && typeof payload.errors === "object" ? payload.errors : {};

  const parts = [];
  if (errorMessages.length) {
    parts.push(errorMessages.join("; "));
  }
  if (Object.keys(fieldErrors).length) {
    parts.push(
      Object.entries(fieldErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join("; "),
    );
  }

  return parts.length ? parts.join(" / ") : `HTTP ${status}`;
}

function markdownToAdf(markdownText) {
  const content = [];
  let paragraphLines = [];
  let bulletItems = [];
  let orderedItems = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    content.push(paragraphNode(paragraphLines));
    paragraphLines = [];
  };

  const flushBullets = () => {
    if (!bulletItems.length) return;
    content.push({
      type: "bulletList",
      content: bulletItems.map((item) => ({
        type: "listItem",
        content: [paragraphNode([item])],
      })),
    });
    bulletItems = [];
  };

  const flushOrdered = () => {
    if (!orderedItems.length) return;
    content.push({
      type: "orderedList",
      content: orderedItems.map((item) => ({
        type: "listItem",
        content: [paragraphNode([item])],
      })),
    });
    orderedItems = [];
  };

  for (const rawLine of markdownText.split(/\r?\n/)) {
    const stripped = rawLine.trim();

    if (!stripped) {
      flushParagraph();
      flushBullets();
      flushOrdered();
      continue;
    }

    if (stripped.startsWith("### ")) {
      flushParagraph();
      flushBullets();
      flushOrdered();
      content.push(headingNode(stripped.slice(4), 3));
      continue;
    }

    if (stripped.startsWith("## ")) {
      flushParagraph();
      flushBullets();
      flushOrdered();
      content.push(headingNode(stripped.slice(3), 2));
      continue;
    }

    if (stripped.startsWith("- ")) {
      flushParagraph();
      flushOrdered();
      bulletItems.push(stripped.slice(2).trim());
      continue;
    }

    if (isOrderedListLine(stripped)) {
      flushParagraph();
      flushBullets();
      orderedItems.push(stripped.split(". ", 2)[1].trim());
      continue;
    }

    if (bulletItems.length) {
      bulletItems[bulletItems.length - 1] += ` ${stripped}`;
      continue;
    }

    if (orderedItems.length) {
      orderedItems[orderedItems.length - 1] += ` ${stripped}`;
      continue;
    }

    paragraphLines.push(stripped);
  }

  flushParagraph();
  flushBullets();
  flushOrdered();

  if (!content.length) {
    content.push(paragraphNode(["내용 없음"]));
  }

  return {
    version: 1,
    type: "doc",
    content,
  };
}

function headingNode(text, level) {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function paragraphNode(lines) {
  const paragraphContent = [];

  lines.forEach((line, index) => {
    if (index > 0) {
      paragraphContent.push({ type: "hardBreak" });
    }
    paragraphContent.push({ type: "text", text: line });
  });

  return {
    type: "paragraph",
    content: paragraphContent.length ? paragraphContent : [{ type: "text", text: "" }],
  };
}

function isOrderedListLine(value) {
  const parts = value.split(". ", 2);
  return parts.length === 2 && /^\d+$/.test(parts[0]);
}

export {
  ISSUE_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  VOC_TYPE_OPTIONS,
  attachFilesToIssue,
  createIssueDrafts,
  createJiraIssue,
  errorResponse,
  extractUploadedFiles,
  getRuntimeConfig,
  getStringField,
  jsonResponse,
};

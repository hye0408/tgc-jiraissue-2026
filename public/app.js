const form = document.getElementById("issue-form");
const draftButton = document.getElementById("draft-button");
const submitButton = document.getElementById("submit-button");
const flashArea = document.getElementById("flash-area");
const draftPanel = document.getElementById("draft-panel");
const draftList = document.getElementById("draft-list");
const resultPanel = document.getElementById("result-panel");
const resultList = document.getElementById("result-list");

const state = {
  drafts: null,
  noticeShownAfterChange: false,
};

bindFormInvalidation();

draftButton.addEventListener("click", handleDraftCreation);
submitButton.addEventListener("click", handleSubmitToJira);

function bindFormInvalidation() {
  form.querySelectorAll("textarea, input, select").forEach((element) => {
    element.addEventListener("input", invalidateDraftsSilently);
    element.addEventListener("change", invalidateDraftsSilently);
  });
}

function invalidateDraftsSilently() {
  if (!state.drafts) {
    return;
  }

  state.drafts = null;
  submitButton.disabled = true;
  draftPanel.classList.add("hidden");
  resultPanel.classList.add("hidden");
  resultList.innerHTML = "";

  if (!state.noticeShownAfterChange) {
    showFlash("info", "입력값이 변경되었습니다. 현재 값으로 등록하려면 초안을 다시 생성해 주세요.");
    state.noticeShownAfterChange = true;
  }
}

async function handleDraftCreation() {
  clearFlashes();

  if (!form.reportValidity()) {
    return;
  }

  setLoadingState(true, "draft");

  try {
    const response = await fetch("/api/drafts", {
      method: "POST",
      body: new FormData(form),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "초안 생성에 실패했습니다.");
    }

    state.drafts = payload.drafts || [];
    state.noticeShownAfterChange = false;
    renderDrafts(state.drafts);
    submitButton.disabled = state.drafts.length === 0;
    resultPanel.classList.add("hidden");
    resultList.innerHTML = "";
    showFlash("success", `이슈 초안 ${state.drafts.length}건이 생성되었습니다. 내용을 확인한 뒤 Jira에 등록해 주세요.`);
  } catch (error) {
    showFlash("error", error.message || "초안 생성 중 오류가 발생했습니다.");
  } finally {
    setLoadingState(false, "draft");
  }
}

async function handleSubmitToJira() {
  clearFlashes();

  if (!state.drafts || state.drafts.length === 0) {
    showFlash("error", "등록할 이슈 초안이 없습니다. 먼저 초안을 생성해 주세요.");
    return;
  }

  setLoadingState(true, "submit");

  try {
    const formData = new FormData(form);
    formData.append("drafts_json", JSON.stringify(state.drafts));

    const response = await fetch("/api/issues", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok && (!payload.results || payload.results.length === 0)) {
      const joinedErrors = (payload.errors || []).join("\n");
      throw new Error(joinedErrors || payload.error || "Jira 등록에 실패했습니다.");
    }

    renderResults(payload.results || []);
    submitButton.disabled = true;

    if (payload.results?.length) {
      showFlash("success", `Jira 이슈 ${payload.results.length}건이 등록되었습니다.`);
    }
    (payload.warnings || []).forEach((warning) => showFlash("warning", warning));
    (payload.errors || []).forEach((errorText) => showFlash("warning", errorText));
  } catch (error) {
    showFlash("error", error.message || "Jira 등록 중 오류가 발생했습니다.");
  } finally {
    setLoadingState(false, "submit");
  }
}

function renderDrafts(drafts) {
  draftList.innerHTML = "";

  drafts.forEach((draft, index) => {
    const card = document.createElement("article");
    card.className = "draft-card";
    card.innerHTML = `
      <div class="draft-head">
        <h3>초안 ${index + 1}</h3>
        <span class="badge">${escapeHtml(draft.report_kind)}</span>
      </div>
      <div class="badge-row">
        <span class="badge">고객사: ${escapeHtml(draft.customer_name)}</span>
        <span class="badge">VOC Type: ${escapeHtml(draft.voc_type)}</span>
        <span class="badge">이슈 유형: ${escapeHtml(draft.category)}</span>
        <span class="badge">심각도: ${escapeHtml(draft.severity)}</span>
      </div>
      <h4>${escapeHtml(draft.summary)}</h4>
      <pre class="draft-text">${escapeHtml(draft.body_markdown)}</pre>
    `;
    draftList.appendChild(card);
  });

  draftPanel.classList.remove("hidden");
}

function renderResults(results) {
  resultList.innerHTML = "";

  results.forEach((result) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <div class="result-head">
        <h3>${escapeHtml(result.key)}</h3>
        <span class="badge">${escapeHtml(result.report_kind)}</span>
      </div>
      <div class="result-meta">
        <div><strong>제목</strong> ${escapeHtml(result.summary)}</div>
        <div><strong>고객사명</strong> ${escapeHtml(result.customer_name)}</div>
        <div><strong>VOC Type</strong> ${escapeHtml(result.voc_type)}</div>
        <div><strong>이슈 유형</strong> ${escapeHtml(result.category)}</div>
        <div><strong>심각도</strong> ${escapeHtml(result.severity)}</div>
        <div><strong>첨부파일 업로드</strong> ${result.attachment_uploaded ? "성공" : "실패"}</div>
        <div><strong>URL</strong> <a href="${escapeAttribute(result.url)}" target="_blank" rel="noreferrer">${escapeHtml(result.url)}</a></div>
      </div>
    `;
    resultList.appendChild(card);
  });

  resultPanel.classList.remove("hidden");
}

function setLoadingState(isLoading, mode) {
  draftButton.disabled = isLoading;
  submitButton.disabled = isLoading || !state.drafts || state.drafts.length === 0;

  if (mode === "draft") {
    draftButton.textContent = isLoading ? "초안 생성 중..." : "이슈 초안 작성하기";
  }
  if (mode === "submit") {
    submitButton.textContent = isLoading ? "Jira 등록 중..." : "지라에 등록하기";
  }
}

function showFlash(level, message) {
  const flash = document.createElement("div");
  flash.className = `flash flash-${level}`;
  flash.innerHTML = `<strong>${getFlashLabel(level)}</strong><p>${escapeHtml(message)}</p>`;
  flashArea.appendChild(flash);
}

function clearFlashes() {
  flashArea.innerHTML = "";
}

function getFlashLabel(level) {
  if (level === "success") return "완료";
  if (level === "warning") return "확인 필요";
  if (level === "info") return "안내";
  return "오류";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

const STORAGE_KEYS = {
  draft: "focusReadingLauncher.currentSession",
  history: "focusReadingLauncher.history",
};

const state = {
  session: null,
  timerId: null,
  startedAt: null,
  remainingSeconds: 0,
};

const els = {
  homeView: document.querySelector("#homeView"),
  ritualView: document.querySelector("#ritualView"),
  readingView: document.querySelector("#readingView"),
  exitView: document.querySelector("#exitView"),
  sessionForm: document.querySelector("#sessionForm"),
  sourceType: document.querySelector("#sourceType"),
  titleInput: document.querySelector("#titleInput"),
  urlInput: document.querySelector("#urlInput"),
  textInput: document.querySelector("#textInput"),
  fileInput: document.querySelector("#fileInput"),
  fileHint: document.querySelector("#fileHint"),
  customMinutes: document.querySelector("#customMinutes"),
  formMessage: document.querySelector("#formMessage"),
  sessionCard: document.querySelector("#sessionCard"),
  historyList: document.querySelector("#historyList"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  backHomeButton: document.querySelector("#backHomeButton"),
  enterReadingButton: document.querySelector("#enterReadingButton"),
  readingTitle: document.querySelector("#readingTitle"),
  contentArea: document.querySelector("#contentArea"),
  timerDisplay: document.querySelector("#timerDisplay"),
  timeProgress: document.querySelector("#timeProgress"),
  readingProgressRange: document.querySelector("#readingProgressRange"),
  readingProgressText: document.querySelector("#readingProgressText"),
  keyPointInput: document.querySelector("#keyPointInput"),
  finishReadingButton: document.querySelector("#finishReadingButton"),
  takeawayInput: document.querySelector("#takeawayInput"),
  exitMessage: document.querySelector("#exitMessage"),
};

function showView(viewName) {
  [els.homeView, els.ritualView, els.readingView, els.exitView].forEach((view) => view.classList.remove("active"));
  els[`${viewName}View`].classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

function saveDraft() {
  if (state.session) {
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(state.session));
  }
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
}

function sourceLabel(type) {
  return { link: "link", text: "text", file: "file" }[type] || type;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(dateValue));
}

function formatTimer(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getDurationMinutes() {
  const selected = document.querySelector("input[name='duration']:checked").value;
  if (selected === "custom") {
    return Number.parseInt(els.customMinutes.value, 10);
  }
  return Number.parseInt(selected, 10);
}

function setFormMessage(message) {
  els.formMessage.textContent = message;
}

function updateSourceFields() {
  const type = els.sourceType.value;
  document.querySelectorAll(".source-field").forEach((field) => {
    field.classList.toggle("hidden", field.dataset.type !== type);
  });
}

function inferTitle(type, payload) {
  if (els.titleInput.value.trim()) return els.titleInput.value.trim();
  if (type === "link") {
    try {
      const url = new URL(payload.url);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return "一篇网页文章";
    }
  }
  if (type === "file") return payload.fileName || "本地文件阅读";
  const firstLine = payload.text.split("\n").find((line) => line.trim());
  return firstLine ? firstLine.slice(0, 36) : "粘贴文本阅读";
}

function buildContentPreview(session) {
  if (session.type === "link") {
    return `这次 Session 的材料是一个网页链接。\n\n${session.url}\n\n建议在新标签页打开链接，把阅读进度留在这里记录。`;
  }
  return session.content || "暂无可预览内容。";
}

function renderSessionCard() {
  if (!state.session) {
    els.sessionCard.className = "session-card empty";
    els.sessionCard.innerHTML = `<p class="muted">还没有创建 Session。先放入一份材料，然后给它一段安静的时间。</p>`;
    return;
  }

  els.sessionCard.className = "session-card";
  els.sessionCard.innerHTML = `
    <h3>${escapeHtml(state.session.title)}</h3>
    <div class="meta-grid">
      <div class="meta-item"><span>来源类型</span><strong>${sourceLabel(state.session.type)}</strong></div>
      <div class="meta-item"><span>预计阅读时长</span><strong>${state.session.durationMinutes} 分钟</strong></div>
      <div class="meta-item"><span>当前状态</span><strong>${state.session.status}</strong></div>
      <div class="meta-item"><span>阅读进度</span><strong>${state.session.readingProgress}%</strong></div>
    </div>
    <progress class="card-progress" max="100" value="${state.session.readingProgress}"></progress>
    <button id="startRitualButton" class="primary-button" type="button">开始进入仪式</button>
  `;
  document.querySelector("#startRitualButton").addEventListener("click", () => showView("ritual"));
}

function renderReadingView() {
  els.readingTitle.textContent = state.session.title;
  els.keyPointInput.value = state.session.keyPoint || "";
  els.readingProgressRange.value = state.session.readingProgress;
  updateReadingProgress(state.session.readingProgress);

  if (state.session.type === "link") {
    els.contentArea.innerHTML = `
      <p>网页链接不会在这里强制嵌入，避免干扰阅读体验。</p>
      <p><a href="${escapeAttribute(state.session.url)}" target="_blank" rel="noopener noreferrer">打开阅读链接 ↗</a></p>
      <p>${escapeHtml(buildContentPreview(state.session))}</p>
    `;
  } else {
    els.contentArea.textContent = buildContentPreview(state.session);
  }
}

function renderHistory() {
  const history = readHistory();
  if (history.length === 0) {
    els.historyList.innerHTML = `<p class="muted">还没有历史记录。完成一次退出仪式后，会在这里看到你的阅读沉淀。</p>`;
    return;
  }
  els.historyList.innerHTML = history
    .map((item) => `
      <article class="history-item">
        <span>${formatDate(item.completedAt)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${sourceLabel(item.type)}</span>
        <span>${item.durationMinutes} 分钟</span>
        <span>${item.readingProgress}%</span>
        <p>${escapeHtml(item.takeaway)}</p>
      </article>
    `)
    .join("");
}

function updateReadingProgress(value) {
  const progress = Number.parseInt(value, 10);
  els.readingProgressRange.value = progress;
  els.readingProgressText.textContent = `${progress}%`;
  if (state.session) {
    state.session.readingProgress = progress;
    saveDraft();
    renderSessionCard();
  }
}

function updateTimerDisplay() {
  els.timerDisplay.textContent = formatTimer(state.remainingSeconds);
  const totalSeconds = state.session.durationMinutes * 60;
  const elapsed = totalSeconds - state.remainingSeconds;
  els.timeProgress.value = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
}

function startTimer() {
  stopTimer();
  state.session.status = "阅读中";
  state.startedAt = Date.now();
  state.remainingSeconds = state.session.durationMinutes * 60;
  renderReadingView();
  updateTimerDisplay();
  saveDraft();
  showView("reading");

  state.timerId = window.setInterval(() => {
    state.remainingSeconds -= 1;
    updateTimerDisplay();
    if (state.remainingSeconds <= 0) {
      enterExitRitual();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function enterExitRitual() {
  stopTimer();
  if (!state.session) return;
  state.session.status = "已完成";
  state.session.keyPoint = els.keyPointInput.value.trim();
  if (state.session.readingProgress < 100 && state.remainingSeconds <= 0) {
    state.session.readingProgress = Math.max(state.session.readingProgress, Number.parseInt(els.readingProgressRange.value, 10));
  }
  els.takeawayInput.value = state.session.keyPoint || "";
  els.exitMessage.textContent = "";
  saveDraft();
  showView("exit");
}

function completeExit() {
  const takeaway = els.takeawayInput.value.trim();
  if (!takeaway) {
    els.exitMessage.textContent = "请先写下这次读到最重要的点。";
    els.takeawayInput.focus();
    return;
  }

  const completedSession = {
    ...state.session,
    takeaway,
    keyPoint: state.session.keyPoint || els.keyPointInput.value.trim(),
    completedAt: new Date().toISOString(),
  };
  saveHistory([completedSession, ...readHistory()].slice(0, 50));
  state.session = null;
  state.remainingSeconds = 0;
  clearDraft();
  renderSessionCard();
  renderHistory();
  els.sessionForm.reset();
  updateSourceFields();
  showView("home");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function readSelectedFile(file) {
  return new Promise((resolve, reject) => {
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension === "pdf" || file.type === "application/pdf") {
      resolve({
        fileName: file.name,
        content: `PDF 文件已加入 Session：${file.name}\n\n第一版暂不解析 PDF 正文。你可以在本地打开 PDF 阅读，并在这里记录时间、进度和关键点。`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({ fileName: file.name, content: String(reader.result || "") });
    reader.onerror = () => reject(new Error("文件读取失败，请换一个 txt 或 md 文件。"));
    reader.readAsText(file);
  });
}

async function createSession(event) {
  event.preventDefault();
  setFormMessage("");
  const type = els.sourceType.value;
  const durationMinutes = getDurationMinutes();

  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    setFormMessage("请设置至少 1 分钟的阅读时间。");
    return;
  }

  let payload = {};
  if (type === "link") {
    const url = els.urlInput.value.trim();
    if (!url) {
      setFormMessage("请先输入网页链接。");
      return;
    }
    try {
      payload.url = new URL(url).href;
    } catch {
      setFormMessage("请输入有效的 URL，例如 https://example.com/article。");
      return;
    }
  }

  if (type === "text") {
    const text = els.textInput.value.trim();
    if (!text) {
      setFormMessage("请先粘贴要阅读的文本。");
      return;
    }
    payload.text = text;
    payload.content = text;
  }

  if (type === "file") {
    const file = els.fileInput.files[0];
    if (!file) {
      setFormMessage("请先选择一个 txt、md 或 pdf 文件。");
      return;
    }
    try {
      payload = await readSelectedFile(file);
    } catch (error) {
      setFormMessage(error.message);
      return;
    }
  }

  state.session = {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
    title: inferTitle(type, payload),
    type,
    status: "未开始",
    durationMinutes,
    readingProgress: 0,
    createdAt: new Date().toISOString(),
    url: payload.url || "",
    fileName: payload.fileName || "",
    content: payload.content || payload.text || "",
    keyPoint: "",
  };

  saveDraft();
  renderSessionCard();
  setFormMessage("阅读卡片已创建。请从进入仪式开始，而不是直接冲进内容。");
}

function restoreDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEYS.draft));
    if (draft && draft.status !== "已完成") {
      state.session = draft;
      renderSessionCard();
    }
  } catch {
    clearDraft();
  }
}

function bindEvents() {
  els.sourceType.addEventListener("change", updateSourceFields);
  els.sessionForm.addEventListener("submit", createSession);
  els.backHomeButton.addEventListener("click", () => showView("home"));
  els.enterReadingButton.addEventListener("click", startTimer);
  els.finishReadingButton.addEventListener("click", () => {
    state.session.keyPoint = els.keyPointInput.value.trim();
    state.session.readingProgress = Math.max(Number.parseInt(els.readingProgressRange.value, 10), state.session.readingProgress);
    enterExitRitual();
  });
  els.completeExitButton.addEventListener("click", completeExit);
  els.readingProgressRange.addEventListener("input", (event) => updateReadingProgress(event.target.value));
  document.querySelectorAll(".quick-progress button").forEach((button) => {
    button.addEventListener("click", () => updateReadingProgress(button.dataset.progress));
  });
  els.keyPointInput.addEventListener("input", () => {
    if (state.session) {
      state.session.keyPoint = els.keyPointInput.value.trim();
      saveDraft();
    }
  });
  els.clearHistoryButton.addEventListener("click", () => {
    if (window.confirm("确定要清空所有本地历史记录吗？")) {
      saveHistory([]);
      renderHistory();
    }
  });
}

bindEvents();
updateSourceFields();
restoreDraft();
renderSessionCard();
renderHistory();

(() => {
  "use strict";
  const store = window.__TOEIC_DATA__;
  const form = document.getElementById("lookupForm");
  const sessionSelect = document.getElementById("sessionSelect");
  const idInput = document.getElementById("idInput");
  const button = document.getElementById("lookupButton");
  const message = document.getElementById("formMessage");
  const resultSection = document.getElementById("resultSection");
  const printButton = document.getElementById("printButton");

  if (!store || !window.crypto?.subtle) {
    message.textContent = "Trình duyệt hiện tại không hỗ trợ tính năng bảo mật cần thiết. Vui lòng dùng Chrome, Edge, Firefox hoặc Safari phiên bản mới.";
    message.className = "form-message is-error";
    button.disabled = true;
    return;
  }

  const meta = store.meta;
  sessionSelect.innerHTML = `<option value="${escapeHtml(meta.sessionId)}">Đợt thi ngày ${escapeHtml(meta.sessionLabel)}</option>`;

  function normalizeId(value) { return String(value || "").trim().replace(/[\s.\-]/g, "").toUpperCase(); }
  function bytesToHex(buffer) { return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join(""); }
  function base64ToBytes(value) { const binary = atob(value); return Uint8Array.from(binary, ch => ch.charCodeAt(0)); }
  function escapeHtml(value) { return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }

  async function makeIndex(sessionId, idNumber) {
    const text = `${store.pepper}|${sessionId}|${idNumber}`;
    return bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  }

  async function decryptRecord(entry, sessionId, idNumber) {
    const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(idNumber), "PBKDF2", false, ["deriveKey"]);
    const aesKey = await crypto.subtle.deriveKey(
      { name:"PBKDF2", salt:base64ToBytes(entry.s), iterations:120000, hash:"SHA-256" },
      baseKey, { name:"AES-GCM", length:256 }, false, ["decrypt"]
    );
    const plain = await crypto.subtle.decrypt(
      { name:"AES-GCM", iv:base64ToBytes(entry.i), additionalData:new TextEncoder().encode(sessionId) },
      aesKey, base64ToBytes(entry.c)
    );
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? "—";
  }

  function renderResult(record) {
    setText("candidateName", record.fullName);
    setText("candidateTestDate", record.testDate);
    setText("scoreListening", record.listening);
    setText("scoreReading", record.reading);
    setText("scoreTotal", record.total);
    setText("proficiency", record.proficiency);
    resultSection.hidden = false;
    requestAnimationFrame(() => resultSection.scrollIntoView({behavior:"smooth",block:"start"}));
  }

  function clearMessage() { message.textContent = ""; message.className = "form-message"; }
  function showMessage(text, type="error") { message.textContent = text; message.className = `form-message is-${type}`; }
  function setLoading(isLoading) { button.disabled = isLoading; button.querySelector(".btn-label").textContent = isLoading ? "Đang tra cứu..." : "Tra cứu kết quả"; }

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); clearMessage(); resultSection.hidden = true;
    const sessionId = sessionSelect.value;
    const idNumber = normalizeId(idInput.value);
    if (!idNumber) { showMessage("Vui lòng nhập số CCCD / ID Number để tra cứu."); idInput.focus(); return; }
    if (idNumber.length < 6 || idNumber.length > 20) { showMessage("Số CCCD / ID Number chưa đúng định dạng. Vui lòng kiểm tra lại."); idInput.focus(); return; }

    setLoading(true);
    try {
      const entry = store.records[await makeIndex(sessionId, idNumber)];
      if (!entry) { showMessage("Không tìm thấy kết quả phù hợp. Vui lòng kiểm tra lại số CCCD / ID Number và đợt thi."); return; }
      renderResult(await decryptRecord(entry, sessionId, idNumber));
      showMessage("Tra cứu thành công.", "info");
    } catch (error) {
      console.error(error);
      showMessage("Không thể đọc dữ liệu kết quả. Vui lòng thử lại hoặc liên hệ đơn vị tổ chức thi.");
    } finally { setLoading(false); }
  });

  idInput.addEventListener("input", () => { clearMessage(); if (!resultSection.hidden) resultSection.hidden = true; });
  printButton.addEventListener("click", () => window.print());
})();
/**
 * clientTools — R1 클라이언트 실행 위임 위젯측 프로토콜 (TeamplGPT specs/003).
 *
 * 서버 SSE `clientToolRequest` 이벤트를 받아:
 *   1) 부모 페이지(kiwibox)의 TeamplGPTHRBridge에 postMessage로 실행 위임
 *   2) 브리지 결과를 받아 서버 `/embed/:embedId/client-tool-result`로 회신
 *
 * 부모 origin은 최초 로드 시 document.referrer로 고정(pin)하여
 * postMessage 송신 대상·수신 검증에 동일하게 사용한다 (테넌트별 도메인 자동 대응).
 */
const REQUEST_TYPE = "teamplgpt:hr-tool-request";
const RESULT_TYPE = "teamplgpt:hr-tool-result";
const BRIDGE_TIMEOUT_MS = 15000;

let pinnedParentOrigin = null;
function getParentOrigin() {
  if (pinnedParentOrigin) return pinnedParentOrigin;
  try {
    pinnedParentOrigin = document.referrer
      ? new URL(document.referrer).origin
      : null;
  } catch {
    pinnedParentOrigin = null;
  }
  return pinnedParentOrigin;
}

function requestBridge(callId, spec, origin) {
  return new Promise((resolve, reject) => {
    if (!origin || window.parent === window) {
      reject(new Error("no parent bridge available"));
      return;
    }
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("bridge timeout"));
    }, BRIDGE_TIMEOUT_MS);

    function onMessage(event) {
      if (event.origin !== origin) return;
      const m = event.data;
      if (!m || m.type !== RESULT_TYPE || m.callId !== callId) return;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve({
        ok: m.ok === true,
        status: Number(m.status) || 0,
        body: typeof m.body === "string" ? m.body : "",
      });
    }

    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: REQUEST_TYPE, callId, spec }, origin);
  });
}

/**
 * SSE clientToolRequest 처리 — 브리지 왕복 후 서버로 결과 회신.
 * 실패해도 반드시 회신한다 (서버 pending을 빨리 해제 — 30s 서버 타임아웃 대기 방지).
 */
export async function handleClientToolRequest(
  chatResult,
  embedSettings,
  sessionId
) {
  const { callId, spec } = chatResult;
  if (!callId || !spec) return;
  const { baseApiUrl, embedId } = embedSettings;

  const result = await requestBridge(callId, spec, getParentOrigin()).catch(
    (e) => ({ ok: false, status: 0, body: `widget: ${e.message}` })
  );

  await fetch(`${baseApiUrl}/${embedId}/client-tool-result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callId, sessionId, ...result }),
  }).catch(() => {});
}

export const CLIENT_TOOL_EVENT_TYPE = "clientToolRequest";

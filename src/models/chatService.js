import { fetchEventSource } from "@microsoft/fetch-event-source";
import { v4 } from "uuid";
import {
  handleClientToolRequest,
  CLIENT_TOOL_EVENT_TYPE,
} from "@/utils/clientTools";

const ChatService = {
  embedSessionHistory: async function (embedSettings, sessionId) {
    const { embedId, baseApiUrl } = embedSettings;
    return await fetch(`${baseApiUrl}/${embedId}/${sessionId}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Invalid response from server");
      })
      .then((res) => {
        return res.history.map((msg) => ({
          ...msg,
          id: v4(),
          sender: msg.role === "user" ? "user" : "system",
          textResponse: msg.content,
          close: false,
        }));
      })
      .catch((e) => {
        console.error(e);
        return [];
      });
  },
  resetEmbedChatSession: async function (embedSettings, sessionId) {
    const { baseApiUrl, embedId } = embedSettings;
    return await fetch(`${baseApiUrl}/${embedId}/${sessionId}`, {
      method: "DELETE",
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  streamChat: async function (sessionId, embedSettings, message, handleChat) {
    const { baseApiUrl, embedId, username } = embedSettings;
    const overrides = {
      prompt: embedSettings?.prompt ?? null,
      model: embedSettings?.model ?? null,
      temperature: embedSettings?.temperature ?? null,
    };

    const ctrl = new AbortController();
    await fetchEventSource(`${baseApiUrl}/${embedId}/stream-chat`, {
      method: "POST",
      body: JSON.stringify({
        message,
        sessionId,
        username,
        ...overrides,
      }),
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok) {
          return; // everything's good
        } else if (response.status >= 400) {
          await response
            .json()
            .then((serverResponse) => {
              handleChat(serverResponse);
            })
            .catch(() => {
              handleChat({
                id: v4(),
                type: "abort",
                textResponse: null,
                sources: [],
                close: true,
                error: `An error occurred while streaming response. Code ${response.status}`,
              });
            });
          ctrl.abort();
          throw new Error();
        } else {
          handleChat({
            id: v4(),
            type: "abort",
            textResponse: null,
            sources: [],
            close: true,
            error: `An error occurred while streaming response. Unknown Error.`,
          });
          ctrl.abort();
          throw new Error("Unknown Error");
        }
      },
      async onmessage(msg) {
        try {
          const chatResult = JSON.parse(msg.data);
          // R1 클라이언트 실행 위임: 부모 브리지 왕복 후 서버 회신.
          // 채팅 UI에는 표시하지 않는다 (handleChat은 unknown type 무시하지만 명시 분기).
          if (chatResult.type === CLIENT_TOOL_EVENT_TYPE) {
            handleClientToolRequest(chatResult, embedSettings, sessionId);
            return;
          }
          handleChat(chatResult);
        } catch {}
      },
      onerror(err) {
        handleChat({
          id: v4(),
          type: "abort",
          textResponse: null,
          sources: [],
          close: true,
          error: `An error occurred while streaming response. ${err.message}`,
        });
        ctrl.abort();
        throw new Error();
      },
    });
  },
};

export default ChatService;

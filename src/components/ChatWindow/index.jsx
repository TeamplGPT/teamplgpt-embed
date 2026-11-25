import ChatWindowHeader from "./Header";
import SessionId from "../SessionId";
import useChatHistory from "@/hooks/chat/useChatHistory";
import ChatContainer from "./ChatContainer";
import Sponsor from "../Sponsor";
import { ChatHistoryLoading } from "./ChatContainer/ChatHistory";
import ResetChat from "../ResetChat";

export default function ChatWindow({ closeChat, settings, sessionId }) {
  const { chatHistory, setChatHistory, loading } = useChatHistory(
    settings,
    sessionId
  );

  if (loading) {
    return (
      <div className="allm-flex allm-flex-col allm-h-full">
        <ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
        />
        <ChatHistoryLoading />
        <div className="allm-pt-4 allm-pb-2 allm-h-fit allm-gap-y-1">
          <SessionId />
          <Sponsor settings={settings} />
        </div>
      </div>
    );
  }

  setEventDelegatorForCodeSnippets();

  return (
    <div className="allm-flex allm-flex-col allm-h-full">
      {!settings.noHeader && (
        <ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
        />
      )}
      <div className="allm-flex-grow allm-min-h-0 allm-overflow-hidden">
        <ChatContainer
          sessionId={sessionId}
          settings={settings}
          knownHistory={chatHistory}
        />
      </div>
      {/* 새 대화는 위쪽 막대의 아이콘 버튼이 맡는다(okrservice 챗봇과 같다). 위쪽 막대를
          끈 호스트만 아래 줄에서 초기화·닫기를 쓴다. 후원 문구는 끄지 않았을 때만 그린다. */}
      {(settings.noHeader || !settings.noSponsor) && (
        <div className="allm-py-2 allm-h-fit allm-gap-y-2 allm-z-10 allm-bg-white allm-rounded-b-2xl">
          <Sponsor settings={settings} />
          {settings.noHeader && (
            <ResetChat
              setChatHistory={setChatHistory}
              settings={settings}
              sessionId={sessionId}
              closeChat={closeChat}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`);
  if (!target) return false;

  const markdown =
    target.parentElement?.parentElement?.querySelector(
      "pre:first-of-type"
    )?.innerText;
  if (!markdown) return false;

  window.navigator.clipboard.writeText(markdown);

  target.classList.add("allm-text-green-500");
  const originalText = target.innerHTML;
  target.innerText = "Copied!";
  target.setAttribute("disabled", true);

  setTimeout(() => {
    target.classList.remove("allm-text-green-500");
    target.innerHTML = originalText;
    target.removeAttribute("disabled");
  }, 2500);
}

// Listens and hunts for all data-code-snippet clicks.
function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}

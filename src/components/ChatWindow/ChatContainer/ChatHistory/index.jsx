import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import { BotBubble } from "./Bubble";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, CircleNotch } from "@phosphor-icons/react";
import debounce from "lodash.debounce";
import { SEND_TEXT_EVENT } from "..";
import { THEME, accentOf } from "@/utils/theme";

// 대화 스레드 칸 — okrservice 챗봇처럼 옅은 바탕 위에 말풍선을 10px 간격으로 쌓는다
const THREAD_STYLE = {
  background: THEME.threadBackground,
  padding: "16px 16px 8px",
  gap: "10px",
};

export default function ChatHistory({ settings = {}, history = [] }) {
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleScroll = () => {
    if (!chatHistoryRef.current) return;
    const diff =
      chatHistoryRef.current.scrollHeight -
      chatHistoryRef.current.scrollTop -
      chatHistoryRef.current.clientHeight;
    // Fuzzy margin for what qualifies as "bottom". Stronger than straight comparison since that may change over time.
    const isBottom = diff <= 40;
    setIsAtBottom(isBottom);
  };

  const debouncedScroll = debounce(handleScroll, 100);
  useEffect(() => {
    function watchScrollEvent() {
      if (!chatHistoryRef.current) return null;
      const chatHistoryElement = chatHistoryRef.current;
      if (!chatHistoryElement) return null;
      chatHistoryElement.addEventListener("scroll", debouncedScroll);
    }
    watchScrollEvent();
  }, []);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  if (history.length === 0) {
    // okrservice 챗봇 첫 화면처럼 인사 말풍선 바로 아래에 예시 질문을 둔다.
    // 무엇을 물어볼지 모를 때 인사를 읽은 눈이 그대로 질문으로 내려온다.
    return (
      <div
        style={THREAD_STYLE}
        className="allm-h-full allm-overflow-y-auto allm-flex allm-flex-col allm-no-scroll"
      >
        <GreetingMessage settings={settings} />
        <SuggestedMessages settings={settings} />
      </div>
    );
  }

  return (
    <div
      style={THREAD_STYLE}
      className="allm-h-full allm-overflow-y-auto allm-flex allm-flex-col allm-justify-start allm-no-scroll"
      id="chat-history"
      ref={chatHistoryRef}
    >
      <div className="allm-flex allm-flex-col" style={{ gap: "10px" }}>
        {history.map((props, index) => {
          const isLastMessage = index === history.length - 1;
          const isLastBotReply =
            index === history.length - 1 && props.role === "assistant";

          if (isLastBotReply && props.animate) {
            return (
              <PromptReply
                key={props.uuid}
                ref={isLastMessage ? replyRef : null}
                uuid={props.uuid}
                reply={props.content}
                pending={props.pending}
                sources={props.sources}
                error={props.error}
                closed={props.closed}
              />
            );
          }

          return (
            <HistoricalMessage
              key={index}
              ref={isLastMessage ? replyRef : null}
              message={props.content}
              sentAt={props.sentAt || Date.now() / 1000}
              role={props.role}
              sources={props.sources}
              chatId={props.chatId}
              feedbackScore={props.feedbackScore}
              error={props.error}
              errorMsg={props.errorMsg}
            />
          );
        })}
      </div>
      {!isAtBottom && (
        <div className="allm-fixed allm-bottom-[10rem] allm-right-[50px] allm-z-50 allm-cursor-pointer">
          <div className="allm-flex allm-flex-col allm-items-center">
            <div
              style={{
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                boxShadow: THEME.shadow.subtle,
                color: THEME.muted,
              }}
              className="allm-rounded-full allm-w-8 allm-h-8 allm-flex allm-items-center allm-justify-center"
            >
              <ArrowDown
                weight="bold"
                className="allm-w-4 allm-h-4"
                onClick={scrollToBottom}
                id="scroll-to-bottom-button"
                aria-label="Scroll to bottom"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatHistoryLoading() {
  return (
    <div className="allm-h-full allm-w-full allm-relative">
      <div className="allm-h-full allm-max-h-[82vh] allm-pb-[100px] allm-pt-[5px] allm-bg-gray-100 allm-rounded-lg allm-px-2 allm-h-full allm-mt-2 allm-gap-y-2 allm-overflow-y-scroll allm-flex allm-flex-col allm-justify-start allm-no-scroll">
        <div className="allm-flex allm-h-full allm-flex-col allm-items-center allm-justify-center">
          <CircleNotch
            size={14}
            className="allm-text-slate-400 allm-animate-spin"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 대화 시작 전 인사말. 첫 화면이 곧 "상담원이 먼저 말을 건 상태"로 읽혀야 무엇을 하는
 * 창인지 전달된다. 실제 답변과 같은 말풍선을 쓴다.
 */
function GreetingMessage({ settings }) {
  const greeting = settings?.greeting ?? "Send a chat to get started.";
  return <BotBubble>{greeting}</BotBubble>;
}

/**
 * 예시 질문 — okrservice 챗봇의 "이런 걸 물어볼 수 있어요" 칩.
 * 눌러서 보내는 것이므로 말풍선이 아니라 알약 모양 칩이다. 평소에는 옅은 테두리,
 * 마우스를 올리면 테두리만 강조색으로 바뀐다. 제목 줄은 data-suggestions-label이
 * 있을 때만 그린다.
 */
function SuggestedMessages({ settings }) {
  if (!settings?.defaultMessages?.length) return null;
  const label = settings.suggestionsLabel;

  return (
    <div
      role="group"
      aria-label={label || undefined}
      className="allm-flex allm-flex-col"
      style={{ gap: "8px", marginTop: "4px" }}
    >
      {label && (
        <div
          style={{
            padding: "0 2px",
            fontSize: "11.5px",
            fontWeight: 700,
            color: THEME.muted,
          }}
          className="allm-font-sans"
        >
          {label}
        </div>
      )}
      <div className="allm-flex allm-flex-wrap" style={{ gap: "6px" }}>
        {settings.defaultMessages.map((content, i) => (
          <SuggestionChip
            key={i}
            index={i}
            content={content}
            accent={accentOf(settings)}
          />
        ))}
      </div>
    </div>
  );
}

function SuggestionChip({ index, content, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(SEND_TEXT_EVENT, { detail: { command: content } })
        );
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: 0,
        animationDelay: `${index * 60}ms`,
        padding: "6px 11px",
        border: `1px solid ${hovered ? accent : THEME.chipBorder}`,
        borderRadius: "999px",
        background: THEME.card,
        color: THEME.chipText,
        fontSize: "12.5px",
        lineHeight: 1.35,
        textAlign: "left",
        wordBreak: "keep-all",
        transition: "border-color 0.15s ease",
      }}
      className="msg-suggestion allm-cursor-pointer allm-font-sans"
    >
      {content}
    </button>
  );
}

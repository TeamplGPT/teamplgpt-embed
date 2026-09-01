import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, CircleNotch } from "@phosphor-icons/react";
import { embedderSettings } from "@/main";
import debounce from "lodash.debounce";
import { SEND_TEXT_EVENT } from "..";

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
    // 인사말은 위, 예시 질문은 아래로 갈라 놓는다. 둘 다 가운데 모으면 600px 창에서
    // 위아래가 텅 비고, 예시 질문도 입력창에서 멀어져 누르기 번거롭다.
    return (
      <div className="allm-h-full allm-overflow-y-auto allm-px-2 allm-py-4 allm-flex allm-flex-col allm-justify-between allm-gap-y-4 allm-no-scroll">
        <GreetingMessage settings={settings} />
        <SuggestedMessages settings={settings} />
      </div>
    );
  }

  return (
    <div
      className="allm-h-full allm-overflow-y-auto allm-px-2 allm-pt-4 allm-pb-8 allm-flex allm-flex-col allm-justify-start allm-no-scroll"
      id="chat-history"
      ref={chatHistoryRef}
    >
      <div className="allm-flex allm-flex-col allm-gap-y-4">
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
        <div className="allm-fixed allm-bottom-[10rem] allm-right-[50px] allm-z-50 allm-cursor-pointer allm-animate-pulse">
          <div className="allm-flex allm-flex-col allm-items-center">
            <div className="allm-rounded-full allm-border allm-border-white/10 allm-bg-black/20 hover:allm-bg-black/50 allm-w-8 allm-h-8 allm-flex allm-items-center allm-justify-center">
              <ArrowDown
                weight="bold"
                className="allm-text-white/50 allm-w-4 allm-h-4"
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
 * 대화 시작 전 인사말. 회색 가운데 정렬 문단이던 것을 어시스턴트 말풍선으로 바꿨다.
 * 첫 화면이 곧 "상담원이 먼저 말을 건 상태"로 읽혀야 무엇을 하는 창인지 전달된다.
 * 실제 답변과 같은 아이콘·같은 말풍선 스타일을 쓴다 — 여기서만 다르면 첫 답변이
 * 오는 순간 모양이 튄다.
 */
function GreetingMessage({ settings }) {
  const greeting = settings?.greeting ?? "Send a chat to get started.";
  return (
    <div className="allm-flex allm-items-start allm-w-full allm-h-fit">
      <img
        src={embedderSettings.settings.assistantIcon || AnythingLLMIcon}
        alt=""
        className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2"
      />
      <div
        style={{
          wordBreak: "break-word",
          backgroundColor: embedderSettings.ASSISTANT_STYLES.msgBg,
          fontSize: settings.textSize,
        }}
        className={`allm-py-[11px] allm-px-4 allm-flex allm-flex-col allm-font-sans allm-text-left ${embedderSettings.ASSISTANT_STYLES.base} allm-shadow-[0_2px_10px_rgba(30,41,59,0.07)]`}
      >
        {greeting}
      </div>
    </div>
  );
}

/**
 * 예시 질문. 종전에는 폭 75%짜리 진한 블록 버튼이라 말풍선처럼 보여서 "이미 대화가
 * 오간 화면"으로 오해됐고, 그래서 호스트(notion-cms)가 이 기능을 아예 껐다.
 *
 * 눌러서 보내는 것이므로 말풍선이 아니라 **칩**이어야 한다 — 내용 길이만큼만 차지하고,
 * 테두리로 눌리는 것임을 알리고, 색은 강조색을 옅게만 쓴다.
 */
function SuggestedMessages({ settings }) {
  if (!settings?.defaultMessages?.length) return null;
  const accent = settings.buttonColor || "#0EA5E9";

  return (
    <div className="allm-flex allm-flex-wrap allm-gap-2 allm-justify-end allm-px-2">
      {settings.defaultMessages.map((content, i) => (
        <button
          key={i}
          style={{
            opacity: 0,
            animationDelay: `${i * 60}ms`,
            wordBreak: "break-word",
            color: accent,
            borderColor: `${accent}59`,
            fontSize: settings.textSize
              ? `${Math.max(12, Number(settings.textSize) - 2)}px`
              : undefined,
          }}
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(SEND_TEXT_EVENT, { detail: { command: content } })
            );
          }}
          className="msg-suggestion allm-bg-white allm-border allm-border-solid hover:allm-bg-slate-50 allm-cursor-pointer allm-px-3 allm-py-[7px] allm-rounded-full allm-font-sans allm-leading-tight allm-transition-colors"
        >
          {content}
        </button>
      ))}
    </div>
  );
}

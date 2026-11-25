import React, { memo, forwardRef, useState } from "react";
import { Warning, CaretDown } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import DOMPurify from "@/utils/chat/purify";
import { embedderSettings } from "@/main";
import { v4 } from "uuid";
import {
  BotBubble,
  ErrorBubble,
  MessageColumn,
  MessageTime,
  UserBubble,
} from "../Bubble";

const ThoughtBubble = ({ thought }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!thought || !embedderSettings.settings.showThoughts) return null;

  return (
    <div className="allm-mb-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="allm-cursor-pointer allm-flex allm-items-center allm-gap-x-1.5 allm-text-gray-400 hover:allm-text-gray-500"
      >
        <CaretDown
          size={14}
          weight="bold"
          className={`allm-transition-transform ${isExpanded ? "allm-rotate-180" : ""}`}
        />
        <span className="allm-text-xs allm-font-medium">View thoughts</span>
      </div>
      {isExpanded && (
        <div className="allm-mt-2 allm-mb-3 allm-pl-0 allm-border-l-2 allm-border-gray-200">
          <div className="allm-text-xs allm-text-gray-600 allm-font-mono allm-whitespace-pre-wrap">
            {thought.trim()}
          </div>
        </div>
      )}
    </div>
  );
};

const HistoricalMessage = forwardRef(
  (
    {
      uuid = v4(),
      message,
      role,
      sources = [],
      error = false,
      errorMsg = null,
      sentAt,
    },
    ref
  ) => {
    if (error) console.error(`ANYTHING_LLM_CHAT_WIDGET_ERROR: ${error}`);

    // 서버가 거절한 답(abort)은 본문이 null로 온다. 마크다운 변환기는 글자가 아니면
    // 예외를 던져 위젯 전체가 내려가므로, 글자가 아니면 빈 글로 다룬다.
    const text = typeof message === "string" ? message : "";

    // Extract content between think tags if they exist
    const thinkMatches = text.match(/<think>([\s\S]*?)<\/think>/g) || [];
    const thoughts = thinkMatches.map((match) =>
      match.replace(/<think>|<\/think>/g, "").trim()
    );

    // Get the response content without the think tags
    const responseContent = text
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();

    const isUser = role === "user";
    // 변환은 말풍선을 그릴 때만 한다 — 오류 말풍선에는 본문이 없다
    const renderBody = () => (
      <span
        className="allm-whitespace-pre-line allm-flex allm-flex-col allm-gap-y-1"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(renderMarkdown(responseContent || text)),
        }}
      />
    );

    let bubble;
    if (error) {
      // 서버가 준 거절 사유(예: "Invalid request.")는 error에 글자로 온다
      const reason =
        errorMsg ||
        (typeof error === "string" ? error : null) ||
        "Server error";
      bubble = (
        <ErrorBubble ref={ref}>
          <span className="allm-inline-flex allm-items-center allm-gap-x-1">
            <Warning className="allm-h-4 allm-w-4" />
            Could not respond to message.
          </span>
          <p className="allm-text-xs allm-font-mono allm-mt-2 allm-mb-0">
            {reason}
          </p>
        </ErrorBubble>
      );
    } else if (isUser) {
      bubble = <UserBubble ref={ref}>{renderBody()}</UserBubble>;
    } else {
      bubble = (
        <BotBubble ref={ref}>
          {thoughts.length > 0 && (
            <ThoughtBubble thought={thoughts.join("\n\n")} />
          )}
          {renderBody()}
        </BotBubble>
      );
    }

    return (
      <div key={uuid}>
        <MessageColumn alignRight={isUser}>
          {bubble}
          <MessageTime sentAt={sentAt} alignRight={isUser} />
        </MessageColumn>
      </div>
    );
  }
);

export default memo(HistoricalMessage);

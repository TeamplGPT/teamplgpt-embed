import { forwardRef, memo, useState } from "react";
import { Warning, CircleNotch, CaretDown } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import { embedderSettings } from "@/main";
import { BotBubble, ErrorBubble, MessageColumn, MessageTime } from "../Bubble";

const ThinkingIndicator = ({ hasThought }) => {
  if (hasThought) {
    return (
      <div className="allm-flex allm-items-center allm-gap-x-2 allm-text-gray-500">
        <CircleNotch size={16} className="allm-animate-spin" />
        <span className="allm-text-sm">Thinking...</span>
      </div>
    );
  }
  return <div className="allm-mx-4 allm-my-1 allm-dot-falling"></div>;
};

const ThoughtBubble = ({ thought }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!thought || !embedderSettings.settings.showThoughts) return null;

  const cleanThought = thought.replace(/<\/?think>/g, "").trim();

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
            {cleanThought}
          </div>
        </div>
      )}
    </div>
  );
};

const PromptReply = forwardRef(
  ({ uuid, reply, pending, error, sources = [], sentAt }, ref) => {
    if (!reply && sources.length === 0 && !pending && !error) return null;
    if (error) console.error(`ANYTHING_LLM_CHAT_WIDGET_ERROR: ${error}`);

    // Extract content between think tags if they exist
    const thinkMatches = reply?.match(/<think>([\s\S]*?)<\/think>/g) || [];
    const thoughts = thinkMatches.map((match) =>
      match.replace(/<\/?think>/g, "").trim()
    );

    const hasIncompleteThinkTag =
      reply?.includes("<think>") && !reply?.includes("</think>");

    // For incomplete think tags during streaming, extract the content after the opening tag
    const streamingThought = hasIncompleteThinkTag
      ? reply
          ?.split("<think>")
          .pop()
          ?.replace(/<\/?think>/g, "")
          .trim()
      : null;

    const isThinking = hasIncompleteThinkTag || pending;

    // Get the response content without the think tags - clean more aggressively
    const responseContent = reply
      ?.replace(/<think>[\s\S]*?<\/think>/g, "") // Remove complete think blocks
      .replace(/<think>.*$/g, "") // Remove any incomplete think blocks at the end
      .replace(/<\/?think>/g, "") // Remove any stray think tags
      .trim();

    if (isThinking) {
      return (
        <MessageColumn>
          <BotBubble ref={ref}>
            {hasIncompleteThinkTag && streamingThought && (
              <ThoughtBubble thought={streamingThought} />
            )}
            <ThinkingIndicator hasThought={hasIncompleteThinkTag} />
          </BotBubble>
        </MessageColumn>
      );
    }

    if (error) {
      return (
        <MessageColumn>
          <ErrorBubble ref={ref}>
            <span className="allm-inline-flex allm-items-center allm-gap-x-1">
              <Warning className="allm-h-4 allm-w-4" />
              Could not respond to message.
            </span>
            <span className="allm-text-xs">Server error</span>
          </ErrorBubble>
        </MessageColumn>
      );
    }

    return (
      <div key={uuid}>
        <MessageColumn>
          <BotBubble ref={ref}>
            {thoughts.length > 0 && (
              <ThoughtBubble thought={thoughts.join("\n\n")} />
            )}
            <span
              className="allm-reply allm-whitespace-pre-line allm-font-normal allm-flex allm-flex-col allm-gap-y-1"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(responseContent || ""),
              }}
            />
          </BotBubble>
          <MessageTime sentAt={sentAt} />
        </MessageColumn>
      </div>
    );
  }
);

export default memo(PromptReply);

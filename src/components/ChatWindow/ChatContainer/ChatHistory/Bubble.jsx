import { forwardRef } from "react";
import { embedderSettings } from "@/main";
import { formatDate } from "@/utils/date";
import { THEME, textSizeOf } from "@/utils/theme";

/**
 * 대화 말풍선 — 인사말, 지난 대화, 지금 오는 답변이 모두 이 모양을 쓴다.
 * 한 곳만 달라도 첫 답변이 오는 순간 모양이 튄다.
 *
 * okrservice 챗봇처럼 아바타·이름 줄 없이 정렬과 색만으로 누가 말했는지 가른다.
 * 봇은 왼쪽 흰 말풍선(왼쪽 아래만 각짐), 사용자는 오른쪽 강조색 말풍선(오른쪽 아래만 각짐).
 */
const { bubble, tail } = THEME.radius;

function baseStyle() {
  return {
    padding: "11px 14px",
    fontSize: `${textSizeOf(embedderSettings.settings)}px`,
    lineHeight: 1.62,
    wordBreak: "break-word",
    maxWidth: "100%",
    width: "fit-content",
    boxSizing: "border-box",
  };
}

export const BotBubble = forwardRef(({ children, full = false }, ref) => (
  <div
    ref={ref}
    style={{
      ...baseStyle(),
      width: full ? "100%" : "fit-content",
      alignSelf: "flex-start",
      background: embedderSettings.ASSISTANT_STYLES.msgBg,
      border: `1px solid ${THEME.border}`,
      borderRadius: `${bubble}px ${bubble}px ${bubble}px ${tail}px`,
      boxShadow: THEME.shadow.subtle,
      color: THEME.foreground,
    }}
    className="allm-font-sans allm-anything-llm-assistant-message"
  >
    {children}
  </div>
));

export const UserBubble = forwardRef(({ children }, ref) => (
  <div
    ref={ref}
    style={{
      ...baseStyle(),
      maxWidth: "85%",
      alignSelf: "flex-end",
      background: embedderSettings.USER_STYLES.msgBg,
      borderRadius: `${bubble}px ${bubble}px ${tail}px ${bubble}px`,
      color: "#FFFFFF",
    }}
    className="allm-font-sans allm-anything-llm-user-message"
  >
    {children}
  </div>
));

export const ErrorBubble = forwardRef(({ children }, ref) => (
  <div
    ref={ref}
    style={{
      ...baseStyle(),
      width: "100%",
      alignSelf: "flex-start",
      background: THEME.error.background,
      border: `1px solid ${THEME.error.border}`,
      borderRadius: `${bubble}px ${bubble}px ${bubble}px ${tail}px`,
      color: THEME.error.text,
    }}
    className="allm-font-sans"
  >
    {children}
  </div>
));

export function MessageTime({ sentAt, alignRight = false }) {
  if (!sentAt) return null;
  return (
    <div
      style={{
        fontSize: "10.5px",
        color: THEME.muted,
        textAlign: alignRight ? "right" : "left",
        padding: "0 4px",
      }}
      className="allm-font-sans"
    >
      {formatDate(sentAt)}
    </div>
  );
}

// 말풍선과 시간을 한 줄기로 묶는다. 사용자 쪽은 오른쪽으로 붙인다.
export function MessageColumn({ children, alignRight = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: alignRight ? "flex-end" : "flex-start",
        gap: "4px",
        width: "100%",
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

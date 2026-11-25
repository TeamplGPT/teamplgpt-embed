import {
  Plus,
  ChatCircleDots,
  Headset,
  Binoculars,
  MagnifyingGlass,
  MagicWand,
} from "@phosphor-icons/react";
import { accentOf, withAlpha } from "@/utils/theme";

/**
 * 말풍선 속 로봇 눈. 말풍선(대화)과 로봇(챗봇)을 합쳐 "챗봇에 묻는 버튼"으로 읽히게 한다
 * (insa.team 2026-11-25). phosphor 아이콘과 같게 크기는 글자 크기(1em)를 따른다.
 */
function ChatBotIcon({ className = "", style }) {
  return (
    <svg
      className={className}
      style={style}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CHAT_ICONS = {
  plus: Plus,
  chatBubble: ChatCircleDots,
  chatBot: ChatBotIcon,
  support: Headset,
  search2: Binoculars,
  search: MagnifyingGlass,
  magic: MagicWand,
};

export default function OpenButton({ settings, isOpen, toggleOpen }) {
  if (isOpen) return null;
  const ChatIcon = CHAT_ICONS.hasOwnProperty(settings?.chatIcon)
    ? CHAT_ICONS[settings.chatIcon]
    : CHAT_ICONS.plus;
  // data-button-text가 있으면 아이콘 옆에 글자를 붙인 알약 버튼이 된다. 없으면 원형 그대로
  const text =
    typeof settings?.buttonText === "string" ? settings.buttonText.trim() : "";
  const shape = text
    ? "allm-gap-1.5 allm-rounded-full allm-text-[15px] allm-font-bold"
    : "allm-p-4 allm-rounded-full allm-text-2xl";
  return (
    // 그림자와 호버 확대를 준다. 평면 원형 버튼은 페이지 배경에 붙어 보여
    // "떠 있는 상담 버튼"으로 읽히지 않았다.
    <button
      style={{
        backgroundColor: accentOf(settings),
        boxShadow: `0 6px 20px ${withAlpha(accentOf(settings), 0.35)}`,
        ...(text ? { height: "48px", padding: "0 18px 0 15px" } : {}),
      }}
      id="anything-llm-embed-chat-button"
      onClick={toggleOpen}
      className={`hover:allm-cursor-pointer allm-border-none allm-flex allm-items-center allm-justify-center allm-text-white allm-transition-transform allm-duration-150 hover:allm-scale-105 active:allm-scale-95 ${shape}`}
      aria-label={text || "Toggle Menu"}
    >
      <ChatIcon
        className="text-white"
        style={text ? { fontSize: "20px" } : undefined}
      />
      {text && <span className="allm-font-sans">{text}</span>}
    </button>
  );
}

import {
  Plus,
  ChatCircleDots,
  Headset,
  Binoculars,
  MagnifyingGlass,
  MagicWand,
} from "@phosphor-icons/react";

const CHAT_ICONS = {
  plus: Plus,
  chatBubble: ChatCircleDots,
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
  return (
    // 그림자와 호버 확대를 준다. 평면 원형 버튼은 페이지 배경에 붙어 보여
    // "떠 있는 상담 버튼"으로 읽히지 않았다.
    <button
      style={{
        backgroundColor: settings.buttonColor,
        boxShadow: "0 6px 20px rgba(18, 81, 143, 0.30)",
      }}
      id="anything-llm-embed-chat-button"
      onClick={toggleOpen}
      className={`hover:allm-cursor-pointer allm-border-none allm-flex allm-items-center allm-justify-center allm-p-4 allm-rounded-full allm-text-white allm-text-2xl allm-transition-transform allm-duration-150 hover:allm-scale-105 active:allm-scale-95`}
      aria-label="Toggle Menu"
    >
      <ChatIcon className="text-white" />
    </button>
  );
}

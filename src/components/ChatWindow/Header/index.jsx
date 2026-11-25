import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import ChatService from "@/models/chatService";
import {
  Check,
  Copy,
  DotsThreeOutlineVertical,
  Envelope,
  NotePencil,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { THEME, isDarkColor } from "@/utils/theme";

// 위쪽 막대는 okrservice 챗봇처럼 흰 바탕이다. 짙은 색 띠를 두르면 창이 페이지 위에서
// 무겁게 떠 보이고, 강조색은 버튼·칩에만 남겨야 눈이 갈 곳이 선다.
// 호스트가 data-header-color로 짙은 색을 넘기면 글자·아이콘을 흰색으로 바꿔 그린다.
const DEFAULT_HEADER_BG = THEME.card;

export default function ChatWindowHeader({
  sessionId,
  settings = {},
  iconUrl = null,
  closeChat,
  setChatHistory,
}) {
  const { t } = useTranslation();
  const [showingOptions, setShowOptions] = useState(false);
  const menuRef = useRef();
  const buttonRef = useRef();

  const handleChatReset = async () => {
    await ChatService.resetEmbedChatSession(settings, sessionId);
    setChatHistory([]);
    setShowOptions(false);
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const headerBg = settings.headerColor || DEFAULT_HEADER_BG;
  const onDark = isDarkColor(headerBg);
  const titleColor = onDark ? "#FFFFFF" : THEME.foreground;
  const subtitleColor = onDark ? "rgba(255, 255, 255, 0.7)" : THEME.muted;
  // 기본 assistantName은 "AnythingLLM Chat Assistant"라 그대로 노출하면 호스트 브랜드와
  // 어긋난다. 사용자가 지정하지 않았으면 이름 줄 자체를 비운다.
  const assistantName =
    settings.assistantName &&
    settings.assistantName !== "AnythingLLM Chat Assistant"
      ? settings.assistantName
      : null;
  const resetLabel = settings.resetChatText || t("chat.reset-chat");

  return (
    <div
      style={{
        backgroundColor: headerBg,
        borderBottom: `1px solid ${onDark ? "transparent" : THEME.border}`,
        minHeight: "56px",
        padding: "8px 8px 8px 16px",
      }}
      className="allm-flex allm-items-center allm-relative allm-rounded-t-2xl allm-gap-x-3 allm-box-border"
      id="anything-llm-header"
    >
      {/* 아이콘은 배경 없이 그대로 얹는다. 이미 원형으로 완결된 이미지에 타일을 깔면
          원 둘레에 사각형이 생긴다. */}
      <img
        className="allm-flex-shrink-0"
        style={{ width: 32, height: 32, objectFit: "contain" }}
        src={iconUrl ?? AnythingLLMIcon}
        alt={iconUrl ? "Brand" : "AnythingLLM Logo"}
      />

      <div className="allm-flex allm-flex-col allm-min-w-0 allm-flex-grow allm-gap-y-[2px]">
        {assistantName && (
          <span
            style={{ color: titleColor, fontSize: "14px" }}
            className="allm-font-sans allm-font-semibold allm-leading-tight allm-truncate"
          >
            {assistantName}
          </span>
        )}
        {settings.assistantSubtitle && (
          <span
            style={{ color: subtitleColor, fontSize: "11.5px" }}
            className="allm-font-sans allm-leading-tight allm-truncate allm-flex allm-items-center allm-gap-x-[5px]"
          >
            <span className="allm-w-[6px] allm-h-[6px] allm-rounded-full allm-bg-[#22C55E] allm-flex-shrink-0" />
            {settings.assistantSubtitle}
          </span>
        )}
      </div>

      <div className="allm-flex allm-gap-x-1 allm-items-center allm-flex-shrink-0">
        <HeaderIconButton
          label={resetLabel}
          onDark={onDark}
          onClick={handleChatReset}
        >
          <NotePencil size={18} />
        </HeaderIconButton>
        {settings.loaded && settings.supportEmail && (
          <HeaderIconButton
            label="Options"
            onDark={onDark}
            buttonRef={buttonRef}
            onClick={() => setShowOptions(!showingOptions)}
          >
            <DotsThreeOutlineVertical size={18} weight="fill" />
          </HeaderIconButton>
        )}
        <HeaderIconButton label="Close" onDark={onDark} onClick={closeChat}>
          <X size={18} weight="bold" />
        </HeaderIconButton>
      </div>
      <OptionsMenu
        settings={settings}
        showing={showingOptions}
        sessionId={sessionId}
        menuRef={menuRef}
      />
    </div>
  );
}

// okrservice 챗봇 위쪽 막대의 아이콘 버튼 — 평소엔 아이콘만, 마우스를 올리면 옅은 바탕.
// 무엇을 하는 버튼인지는 title로 알린다.
function HeaderIconButton({ label, onDark, onClick, buttonRef, children }) {
  const [hovered, setHovered] = useState(false);
  const hoverBg = onDark ? "rgba(255, 255, 255, 0.12)" : THEME.hover;
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      title={label}
      style={{
        width: "34px",
        height: "34px",
        borderRadius: `${THEME.radius.iconButton}px`,
        border: "none",
        background: hovered ? hoverBg : "transparent",
        color: onDark ? "rgba(255, 255, 255, 0.85)" : THEME.muted,
        transition: "background 0.12s ease",
      }}
      className="allm-inline-flex allm-items-center allm-justify-center allm-p-0 hover:allm-cursor-pointer"
    >
      {children}
    </button>
  );
}

function OptionsMenu({ settings, showing, sessionId, menuRef }) {
  if (!showing) return null;
  return (
    <div
      ref={menuRef}
      className="allm-bg-white allm-absolute allm-z-10 allm-flex allm-flex-col allm-gap-y-1 allm-rounded-xl allm-shadow-lg allm-py-2 allm-top-[56px] allm-right-[12px] allm-border allm-border-solid allm-border-gray-100"
    >
      <ContactSupport email={settings.supportEmail} />
      <SessionID sessionId={sessionId} />
    </div>
  );
}

function SessionID({ sessionId }) {
  if (!sessionId) return null;

  const [sessionIdCopied, setSessionIdCopied] = useState(false);

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setSessionIdCopied(true);
    setTimeout(() => setSessionIdCopied(false), 1000);
  };

  if (sessionIdCopied) {
    return (
      <div className="hover:allm-cursor-pointer allm-bg-white allm-gap-x-[12px] hover:allm-bg-gray-100 allm-rounded-lg allm-border-none allm-flex allm-items-center allm-text-base allm-text-[#7A7D7E] allm-font-bold allm-px-4">
        <Check size={20} />
        <p className="allm-text-[14px] allm-font-sans">Copied!</p>
      </div>
    );
  }

  return (
    <button
      onClick={copySessionId}
      className="hover:allm-cursor-pointer allm-bg-white allm-gap-x-[12px] hover:allm-bg-gray-100 allm-rounded-lg allm-border-none allm-flex allm-items-center allm-text-base allm-text-[#7A7D7E] allm-font-bold allm-px-4"
    >
      <Copy size={20} />
      <p className="allm-text-[14px] allm-font-sans">Session ID</p>
    </button>
  );
}

function ContactSupport({ email = null }) {
  if (!email) return null;

  const subject = `Inquiry from ${window.location.origin}`;
  return (
    <a
      href={`mailto:${email}?Subject=${encodeURIComponent(subject)}`}
      className="allm-no-underline hover:allm-underline hover:allm-cursor-pointer allm-bg-white allm-gap-x-[12px] hover:allm-bg-gray-100 allm-rounded-lg allm-border-none allm-flex allm-items-center allm-text-base allm-text-[#7A7D7E] allm-font-bold allm-px-4"
    >
      <Envelope size={20} />
      <p className="allm-text-[14px] allm-font-sans">Email Support</p>
    </a>
  );
}

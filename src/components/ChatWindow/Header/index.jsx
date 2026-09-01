import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import ChatService from "@/models/chatService";
import {
  ArrowCounterClockwise,
  Check,
  Copy,
  DotsThreeOutlineVertical,
  Envelope,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// 헤더 바탕색. 상담원 아바타(#00ADEF)와 같은 계열에서 **가장 어두운 단계**를 쓴다.
// 헤더 → 강조색 → 아바타가 밝기만 세 단계로 갈리면 색은 하나인데 위계가 선다.
//
//   #12518F  헤더    명도 32% · 색상각 210°  ← 가장 어두움. 배경으로 물러난다
//   #0EA5E9  강조    명도 48% · 색상각 199°  ← 버튼·칩·유저 말풍선
//   #00ADEF  아바타  명도 47% · 색상각 197°  ← 포인트로 읽힌다
//
// 헤더 색상각만 210°로 올려 둔 이유: 강조·아바타와 같은 197~199°로 맞추면 짙은 톤에서
// 청록(초록끼)으로 읽힌다. 210°가 파랑으로 보이면서도 아직 한 계열로 이어지는 지점이다.
// 224° 이상(예: #1E3A8A)은 파랑은 확실하나 아바타와 계열이 갈라져 헤더만 따로 논다.
//
// ⚠️ 강조색과 같은 값을 쓰면 헤더가 칩·전송버튼과 동급으로 보이고,
//    아바타와 같은 값을 쓰면 아바타가 헤더에 묻힌다. 둘 다 실측으로 확인했다.
// 호스트가 다른 색을 쓰면 data-header-color로 덮어쓸 수 있다.
const DEFAULT_HEADER_BG = "#12518F";

export default function ChatWindowHeader({
  sessionId,
  settings = {},
  iconUrl = null,
  closeChat,
  setChatHistory,
}) {
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
  // 기본 assistantName은 "AnythingLLM Chat Assistant"라 그대로 노출하면 호스트 브랜드와
  // 어긋난다. 사용자가 지정하지 않았으면 이름 줄 자체를 비운다.
  const assistantName =
    settings.assistantName && settings.assistantName !== "AnythingLLM Chat Assistant"
      ? settings.assistantName
      : null;

  return (
    <div
      style={{ backgroundColor: headerBg }}
      className="allm-flex allm-items-center allm-relative allm-rounded-t-2xl allm-px-4 allm-py-3 allm-gap-x-3"
      id="anything-llm-header"
    >
      {/* 아이콘은 배경 없이 그대로 얹는다. insa 상담원 아이콘처럼 이미 원형으로 완결된
          이미지에 타일을 깔면 원 둘레에 사각형이 생겨 오히려 조잡해진다.
          ⚠️ 짙은 색 단색 로고를 쓸 경우 네이비 헤더에 묻힌다 — 그때는 밝은 변형을
          data-brand-image-url로 넘길 것(헤더 배경은 data-header-color로 바꿀 수 있다). */}
      <img
        className="allm-flex-shrink-0"
        style={{ width: 36, height: 36, objectFit: "contain" }}
        src={iconUrl ?? AnythingLLMIcon}
        alt={iconUrl ? "Brand" : "AnythingLLM Logo"}
      />

      <div className="allm-flex allm-flex-col allm-min-w-0 allm-flex-grow allm-gap-y-[2px]">
        {assistantName && (
          <span className="allm-font-sans allm-text-white allm-text-[15px] allm-font-semibold allm-leading-tight allm-truncate">
            {assistantName}
          </span>
        )}
        {settings.assistantSubtitle && (
          <span className="allm-font-sans allm-text-[12px] allm-leading-tight allm-truncate allm-flex allm-items-center allm-gap-x-[5px] allm-text-white/65">
            <span className="allm-w-[6px] allm-h-[6px] allm-rounded-full allm-bg-[#4ADE80] allm-flex-shrink-0" />
            {settings.assistantSubtitle}
          </span>
        )}
      </div>

      <div className="allm-flex allm-gap-x-1 allm-items-center allm-flex-shrink-0">
        {settings.loaded && (
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowOptions(!showingOptions)}
            className="allm-bg-transparent hover:allm-cursor-pointer allm-border-none allm-rounded-lg allm-p-1 allm-flex allm-items-center allm-text-white/70 hover:allm-text-white hover:allm-bg-white/10 allm-transition-colors"
            aria-label="Options"
          >
            <DotsThreeOutlineVertical size={18} weight="fill" />
          </button>
        )}
        <button
          type="button"
          onClick={closeChat}
          className="allm-bg-transparent hover:allm-cursor-pointer allm-border-none allm-rounded-lg allm-p-1 allm-flex allm-items-center allm-text-white/70 hover:allm-text-white hover:allm-bg-white/10 allm-transition-colors"
          aria-label="Close"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
      <OptionsMenu
        settings={settings}
        showing={showingOptions}
        resetChat={handleChatReset}
        sessionId={sessionId}
        menuRef={menuRef}
      />
    </div>
  );
}

function OptionsMenu({ settings, showing, resetChat, sessionId, menuRef }) {
  const { t } = useTranslation();
  if (!showing) return null;
  return (
    <div
      ref={menuRef}
      className="allm-bg-white allm-absolute allm-z-10 allm-flex allm-flex-col allm-gap-y-1 allm-rounded-xl allm-shadow-lg allm-py-2 allm-top-[62px] allm-right-[12px] allm-border allm-border-solid allm-border-gray-100"
    >
      <button
        onClick={resetChat}
        className="hover:allm-cursor-pointer allm-bg-white allm-gap-x-[12px] hover:allm-bg-gray-100 allm-rounded-lg allm-border-none allm-flex allm-items-center allm-text-base allm-text-[#7A7D7E] allm-font-bold allm-px-4"
      >
        <ArrowCounterClockwise size={20} />
        {/* 호스트가 data-reset-chat-text로 넘긴 문구를 여기서도 쓴다. 종전에는 이 메뉴만
            "Reset Chat"으로 하드코딩돼 있어, 한국어 사이트인데 영어가 섞여 보였다. */}
        <p className="allm-text-[14px] allm-font-sans">
          {settings.resetChatText || t("chat.reset-chat")}
        </p>
      </button>
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

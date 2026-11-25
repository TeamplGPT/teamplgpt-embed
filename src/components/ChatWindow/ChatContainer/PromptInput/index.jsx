import { CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { THEME, accentOf, textSizeOf, withAlpha } from "@/utils/theme";

export default function PromptInput({
  settings,
  message,
  submit,
  onChange,
  inputDisabled,
  buttonDisabled,
}) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const textareaRef = useRef(null);
  // 종전에는 값을 버리고(`[_, setFocused]`) 리렌더 트리거로만 썼다. 포커스 테두리를
  // 그리려면 값 자체가 필요해 이름을 붙였다.
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!inputDisabled && textareaRef.current) {
      textareaRef.current.focus();
    }
    resetTextAreaHeight();
  }, [inputDisabled]);

  const handleSubmit = (e) => {
    setFocused(false);
    submit(e);
  };

  const resetTextAreaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const captureEnter = (event) => {
    if (event.keyCode == 13) {
      if (!event.shiftKey) {
        submit(event);
      }
    }
  };

  const adjustTextArea = (event) => {
    const element = event.target;
    element.style.height = "auto";
    element.style.height =
      event.target.value.length !== 0 ? element.scrollHeight + "px" : "auto";
  };

  const accent = accentOf(settings);
  // 입력이 있을 때만 전송 버튼을 강조색으로 살린다 — 빈 상태에서 밝게 두면
  // 누를 수 있는 것처럼 보여 헛클릭을 부른다.
  const canSend = !buttonDisabled && !!message?.trim();

  // okrservice 챗봇 입력부 — 가는 윗선으로 대화와 가르고, 테두리 입력칸 옆에 둥근 전송 버튼.
  // 포커스가 가면 테두리와 옅은 링을 강조색으로 그려 커서 위치를 알린다.
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        borderTop: `1px solid ${THEME.border}`,
        background: THEME.card,
        padding: "12px 14px",
        gap: "8px",
      }}
      className="allm-w-full allm-flex allm-items-end allm-m-0 allm-box-border"
    >
      <textarea
        ref={textareaRef}
        rows={2}
        onKeyUp={adjustTextArea}
        onKeyDown={captureEnter}
        onChange={onChange}
        required={true}
        disabled={inputDisabled}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          adjustTextArea(e);
        }}
        value={message}
        style={{
          flex: 1,
          minWidth: 0,
          maxHeight: "120px",
          border: `1.5px solid ${focused ? accent : THEME.inputBorder}`,
          boxShadow: focused ? `0 0 0 3px ${withAlpha(accent, 0.12)}` : "none",
          borderRadius: `${THEME.radius.input}px`,
          padding: "10px 12px",
          fontSize: `${textSizeOf(settings)}px`,
          lineHeight: 1.5,
          color: THEME.foreground,
          background: inputDisabled ? THEME.hover : THEME.card,
          boxSizing: "border-box",
          resize: "none",
          outline: "none",
          fontFamily: "inherit",
          transition: "border-color 120ms ease, box-shadow 120ms ease",
        }}
        className="allm-font-sans allm-cursor-text placeholder:allm-text-slate-400"
        placeholder={settings.sendMessageText || t("chat.send-message")}
        id="message-input"
      />
      <button
        ref={formRef}
        type="submit"
        disabled={!canSend}
        style={{
          flexShrink: 0,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          border: "none",
          background: canSend ? accent : THEME.sendDisabled,
          color: "#FFFFFF",
          cursor: canSend ? "pointer" : "not-allowed",
          transition: "background 120ms ease",
        }}
        className="allm-grid allm-place-items-center allm-p-0"
        id="send-message-button"
        aria-label="Send message"
      >
        {buttonDisabled ? (
          <CircleNotch size={18} className="allm-animate-spin" />
        ) : (
          <PaperPlaneTilt size={18} weight="fill" />
        )}
        <span className="allm-sr-only">Send message</span>
      </button>
    </form>
  );
}

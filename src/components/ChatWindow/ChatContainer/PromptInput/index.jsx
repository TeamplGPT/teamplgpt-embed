import { CircleNotch, PaperPlaneRight } from "@phosphor-icons/react";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

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

  return (
    <div className="allm-w-full allm-sticky allm-bottom-0 allm-z-10 allm-flex allm-justify-center allm-items-center allm-bg-white">
      <form
        onSubmit={handleSubmit}
        className="allm-flex allm-flex-col allm-gap-y-1 allm-rounded-t-lg allm-w-full allm-items-center allm-justify-center"
      >
        <div className="allm-flex allm-items-center allm-w-full">
          <div className="allm-bg-white allm-flex allm-flex-col allm-px-4 allm-overflow-hidden allm-w-full">
            {/* 포커스가 갔는지 테두리로 알린다. 종전에는 focus:outline-none만 걸려 있어
                커서가 어디 있는지 시각 단서가 전혀 없었다. 강조색은 호스트가 넘긴
                buttonColor를 그대로 써서 사이트 톤을 따라간다. */}
            <div
              style={{
                border: focused
                  ? `1.5px solid ${settings.buttonColor || "#0EA5E9"}`
                  : "1.5px solid #22262833",
                boxShadow: focused
                  ? `0 0 0 3px ${settings.buttonColor || "#222628"}1A`
                  : "none",
                transition: "border-color 120ms ease, box-shadow 120ms ease",
              }}
              className="allm-flex allm-items-center allm-w-full allm-rounded-2xl allm-bg-white"
            >
              <textarea
                ref={textareaRef}
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
                className="allm-font-sans allm-border-none allm-cursor-text allm-max-h-[100px] allm-text-[14px] allm-mx-2 allm-py-2 allm-w-full allm-text-black allm-bg-transparent placeholder:allm-text-slate-800/60 allm-resize-none active:allm-outline-none focus:allm-outline-none allm-flex-grow"
                placeholder={settings.sendMessageText || t("chat.send-message")}
                id="message-input"
              />
              <button
                ref={formRef}
                type="submit"
                disabled={buttonDisabled}
                className="allm-bg-transparent allm-border-none allm-inline-flex allm-justify-center allm-rounded-2xl allm-cursor-pointer allm-text-black group"
                id="send-message-button"
                aria-label="Send message"
              >
                {buttonDisabled ? (
                  <CircleNotch className="allm-w-4 allm-h-4 allm-animate-spin" />
                ) : (
                  // 입력이 있을 때만 강조색으로 살린다 — 빈 상태에서 밝게 두면
                  // 누를 수 있는 것처럼 보여 헛클릭을 부른다.
                  <PaperPlaneRight
                    size={24}
                    style={message?.length ? { color: settings.buttonColor } : undefined}
                    className={`allm-my-3 allm-transition-colors ${
                      message?.length
                        ? "allm-opacity-100"
                        : "allm-text-[#22262899]/40 group-hover:allm-text-[#22262899]/70"
                    }`}
                    weight="fill"
                  />
                )}
                <span className="allm-sr-only">Send message</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

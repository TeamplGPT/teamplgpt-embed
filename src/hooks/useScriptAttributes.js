import { useEffect, useState } from "react";
import { embedderSettings } from "../main";

const DEFAULT_SETTINGS = {
  embedId: null, //required
  baseApiUrl: null, // required

  // Override properties that can be defined.
  prompt: null, // override
  model: null, // override
  temperature: null, //override
  showThoughts: false, // show the AI's thought process in responses.

  // style parameters
  chatIcon: "plus",
  // 열기 버튼 아이콘 옆 글자("AI 챗봇" 등). 있으면 원형 대신 알약 버튼이 된다.
  buttonText: null,
  brandImageUrl: null, // will be forced into 100x50px container
  greeting: null, // empty chat window greeting.
  buttonColor: "#262626", // must be hex color code
  userBgColor: "#2C2F35", // user text bubble color
  assistantBgColor: "#2563eb", // assistant text bubble color
  noSponsor: null, // Shows sponsor in footer of chat
  sponsorText: "Powered by AnythingLLM", // default sponsor text
  sponsorLink: "https://anythingllm.com", // default sponsor link
  position: "bottom-right", // position of chat button/window
  assistantName: "AnythingLLM Chat Assistant", // default assistant name
  // 헤더 이름 아래 한 줄. 무엇을 물어봐도 되는 창인지 알려준다("인사·노무 상담" 등).
  // 지정하지 않으면 줄 자체를 그리지 않는다 — 빈 줄이 남으면 오히려 헤더가 헐거워 보인다.
  assistantSubtitle: null,
  // 헤더 바탕색. 미지정 시 흰 바탕(okrservice 챗봇과 같은 위쪽 막대)이다. 짙은 색을
  // 넘기면 글자·아이콘이 흰색으로 바뀐다.
  headerColor: null,
  // 예시 질문 칩 위에 붙는 제목("이런 걸 물어볼 수 있어요" 등). 없으면 칩만 그린다.
  suggestionsLabel: null,
  assistantIcon: null, // default assistant icon
  windowHeight: null, // height of chat window in number:css-prefix
  windowWidth: null, // width of chat window in number:css-prefix
  textSize: null, // text size in px (number only)
  noHeader: null, // If set, hide the header above the chatbox
  language: "en", // language of chat interface
  sendMessageText: null, // override text for send message button
  resetChatText: null, // override text for reset chat button

  // behaviors
  openOnLoad: "off", // or "on"
  supportEmail: null, // string of email for contact
  username: null, // The display or readable name set on a script
  defaultMessages: [], // list of strings for default messages.
};

export default function useGetScriptAttributes() {
  const [settings, setSettings] = useState({
    loaded: false,
    ...DEFAULT_SETTINGS,
  });

  useEffect(() => {
    function fetchAttribs() {
      if (!document) return false;
      if (
        !embedderSettings.settings.baseApiUrl ||
        !embedderSettings.settings.embedId
      )
        throw new Error(
          "[AnythingLLM Embed Module::Abort] - Invalid script tag setup detected. Missing required parameters for boot!"
        );

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parseAndValidateEmbedSettings(embedderSettings.settings),
        loaded: true,
      });
    }
    fetchAttribs();
  }, [document]);

  // 예시 질문 칩은 붙은 뒤에도 바뀔 수 있다. 사이트가 화면을 옮기며 스크립트 태그의
  // data-default-messages를 바꾸면 위젯을 다시 붙이지 않고(열어 둔 창·대화 유지) 칩만 바꾼다.
  // 붙는 사이에 바뀐 값도 놓치지 않게 지켜보기 시작할 때 한 번 읽는다.
  useEffect(() => {
    const element = embedderSettings.scriptElement;
    if (!settings.loaded || !element || typeof MutationObserver === "undefined")
      return;

    const readChips = () =>
      setSettings((prev) => ({
        ...prev,
        defaultMessages: validations.defaultMessages(
          element.getAttribute("data-default-messages")
        ),
      }));

    readChips();
    const observer = new MutationObserver(readChips);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-default-messages"],
    });
    return () => observer.disconnect();
  }, [settings.loaded]);

  return settings;
}

const validations = {
  _fallbacks: {
    defaultMessages: [],
  },

  defaultMessages: function (value = null) {
    if (typeof value !== "string") return this._fallbacks.defaultMessages;
    try {
      const list = value.split(",");
      if (
        !Array.isArray(list) ||
        list.length === 0 ||
        !list.every((v) => typeof v === "string" && v.length > 0)
      )
        throw new Error(
          "Invalid default-messages attribute value. Must be array of strings"
        );
      return list.map((v) => v.trim());
    } catch (e) {
      console.error("AnythingLLMEmbed", e);
      return this._fallbacks.defaultMessages;
    }
  },
};

function parseAndValidateEmbedSettings(settings = {}) {
  const validated = {};
  for (let [key, value] of Object.entries(settings)) {
    if (!validations.hasOwnProperty(key)) {
      validated[key] = value;
      continue;
    }

    const validatedValue = validations[key](value);
    validated[key] = validatedValue;
  }

  return validated;
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { parseStylesSrc } from "./utils/constants.js";
import { initI18n } from "./i18n.js";

const appElement = document.createElement("div");
document.body.appendChild(appElement);

const scriptSettings = Object.assign(
  {},
  document?.currentScript?.dataset || {}
);

export const embedderSettings = {
  settings: scriptSettings,
  // 이 위젯을 붙인 스크립트 태그. 사이트가 화면을 옮기며 data-default-messages를 바꾸면
  // useScriptAttributes가 지켜보다 칩만 새로 그린다(insa.team 2026-11-25)
  scriptElement: document?.currentScript || null,
  stylesSrc: parseStylesSrc(document?.currentScript?.src),
  USER_STYLES: {
    msgBg: scriptSettings?.userBgColor ?? "#3DBEF5",
    base: `allm-text-white allm-rounded-t-[18px] allm-rounded-bl-[18px] allm-rounded-br-[4px] allm-mx-[20px]`,
  },
  ASSISTANT_STYLES: {
    msgBg: scriptSettings?.assistantBgColor ?? "#FFFFFF",
    base: `allm-text-[#222628] allm-rounded-t-[18px] allm-rounded-br-[18px] allm-rounded-bl-[4px] allm-mr-[37px] allm-ml-[9px]`,
  },
};

// Initialize i18n after settings are available
initI18n(scriptSettings);

const root = ReactDOM.createRoot(appElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

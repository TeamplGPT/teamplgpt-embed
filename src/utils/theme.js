/**
 * 위젯 디자인 토큰.
 *
 * 구조는 okrservice 챗봇(widgets/client/messenger/components/chatbot/chatbotTheme.ts)을
 * 따른다 — 흰 위쪽 막대, 옅은 바탕의 대화 스레드, 아바타 없이 정렬·색만으로 구분하는
 * 말풍선, 알약 모양 예시 질문, 둥근 전송 버튼.
 *
 * 강조색은 호스트가 data-button-color로 넘기는 값 하나만 쓴다(버튼·칩 테두리·포커스·
 * 전송 버튼). 아래 중립색은 insa.team 화면에서 잰 값이다 — 바탕 #F7F9FE, 카드 테두리
 * #E3E6EF, 본문 #14172B.
 */
export const THEME = {
  foreground: "#14172B",
  muted: "#6D6F78",
  threadBackground: "#F7F9FE",
  card: "#FFFFFF",
  border: "#E3E6EF",
  inputBorder: "#E1E5EE",
  chipBorder: "#DFE1F6",
  chipText: "#333D9D",
  hover: "#F1F2F5",
  sendDisabled: "#C4CFE6",
  error: { background: "#FDECEA", border: "#F5C2C0", text: "#B3261E" },
  radius: { bubble: 16, tail: 5, input: 10, iconButton: 8 },
  shadow: {
    subtle: "0 1px 2px rgba(20, 30, 60, 0.05)",
    window: "0 12px 40px rgba(20, 23, 43, 0.18)",
  },
};

const FALLBACK_ACCENT = "#3758F9";
// okrservice 챗봇의 말풍선·입력창 글자 크기
const DEFAULT_TEXT_SIZE = 13;

export function accentOf(settings) {
  return settings?.buttonColor || FALLBACK_ACCENT;
}

export function textSizeOf(settings) {
  const size = Number(settings?.textSize);
  return Number.isFinite(size) && size > 0 ? size : DEFAULT_TEXT_SIZE;
}

// #RRGGBB에 투명도를 붙인다(포커스 링·그림자용). 형식이 다르면 그대로 돌려준다.
export function withAlpha(hex, alpha) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const value = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hex}${value.toString(16).padStart(2, "0")}`;
}

// 헤더 바탕이 어두우면 글자·아이콘을 흰색으로 바꾼다. 기본 헤더는 흰 바탕이다.
export function isDarkColor(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return false;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

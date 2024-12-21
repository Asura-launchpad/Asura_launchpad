import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=LINE+Seed+Sans+KR:wght@400;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Baskervville:ital@0;1&display=swap');

  body {
    margin: 0;
    line-height: normal;
    background-color: var(--color-background-dark) !important; /* !important 추가 */

  }
  :root {
    /* fonts */
    --font-line-seed-sans-kr: 'LINE Seed Sans KR';

    /* font sizes */
    --font-size-sm: 14px;
    --font-size-3xs: 10px;
    --font-size-base: 16px;

    /* Colors */
    --color-gray-100: #868686;
    --color-gray-200: #1f1f1f;
    --color-gray-300: #0D0C0E;
    --color-dimgray: #535353;
    --color-white: #fff;
    --color-gainsboro: #e6e6e6;
    --color-darkslategray: #343435;
    --color-mediumblue: #FFF623;
    --color-mediumslateblue: #FFFB85;
    --color-darkgray: #ababab;
    --color-red: #FF5959;
    --color-background-dark: #0B0B0B;
    --color-main-border: #3D3D3D;
    --color-main-yellow: #FFF623;
    --color-sub-yellow: #FFF963;

    /* Gaps */
    --gap-sm: 14px;
    --gap-3xs-7: 4.7px;
    --gap-10xs-5: 2.5px;
    --gap-7xs: 6px;
    --gap-8xs: 5px;

    /* Paddings */
    --padding-xl: 20px;
    --padding-xs: 12px;
    --padding-mini: 15px;
    --padding-3xl: 22px;
    --padding-11xs: 2px;
    --padding-sm: 14px;
    --padding-smi: 13px;
    --padding-2xl: 21px;
    --padding-mini-3: 14.3px;
    --padding-smi-4: 12.4px;
    --padding-10xs: 3px;

    /* Border radiuses */
    --br-xl: 24px;
    --br-5xs: 8px;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-line-seed-sans-kr), sans-serif;
  }

  /* 추가 글로벌 스타일 */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 700;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
  }
`;
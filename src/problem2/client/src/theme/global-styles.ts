import { Colors, Fonts, LinesHeight, ScreenSizes } from './StyleConstants';

import { createGlobalStyle } from 'styled-components';

/* istanbul ignore next */
export const GlobalStyle = createGlobalStyle`
html,
body {
  height: 100%;
  width: 100%;
  background: ${Colors.body_bg};
}

body {
  font-family: Roboto;
  color: ${Colors.text_primary};
  font-size: ${Fonts.body_s};
  font-style: normal;
  font-weight: 400;
  line-height: ${LinesHeight.body_s};
}

*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

h1{
  color: ${Colors.text_primary};

  font-family: Roboto;
  font-size: 100px;
  font-style: normal;
  font-weight: 600;
  line-height: 100px; /* 100% */
  letter-spacing: 1px;
}

h2{
  color: ${Colors.text_primary};

  font-family: Roboto;
  font-size: 88px;
  font-style: normal;
  font-weight: 600;
  line-height: 88px; /* 100% */
}

h3{
  color: ${Colors.text_primary};

  font-family: Roboto;
  font-size: 64px;
  font-style: normal;
  font-weight: 600;
  line-height: 64px; /* 100% */
}

h4{
  color: ${Colors.text_primary};

  font-family: Roboto;
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
  line-height: 48px; /* 100% */
}

h5{
  color: ${Colors.text_primary};

  font-family: Roboto;
  font-size: 40px;
  font-style: normal;
  font-weight: 600;
  line-height: 40px; /* 100% */
}

p{
  font-family: Roboto;
  color: ${Colors.text_primary};
  font-size: ${Fonts.body_s};
  font-style: normal;
  font-weight: 400;
  line-height: ${LinesHeight.body_s};
}

/* The animation code */
@keyframes skeleton-loading-effect {
    0% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0 50%;
    }
}

@keyframes rotate {
  100% {
      transform: rotate(360deg);
  }
}
/* add skeleton-loading for skeleton loading animation*/
&.skeleton-loading{
  color: 'transparent';
  background: linear-gradient(90deg, rgba(190, 190, 190, 0.06) 25%, rgba(0, 0, 0, 0.15) 37%, rgba(190, 190, 190, 0.06) 63%);
  background-size: 400% 100%;
  animation-name: skeleton-loading-effect;
  animation-duration: 1.4s;
  animation-timing-function: ease;
  animation-iteration-count: infinite;
  border-radius: 3px;
}

&.skeleton-loading * {
  visibility: hidden;
}

&::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 1px;
}

&::-webkit-scrollbar {
  background-color: rgb(255, 255, 255, 0.3);
  width: 6px;
  height: 1px;
}

&::-webkit-scrollbar-thumb {
  min-height: 16px;
  border-radius: 1px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: ${Colors.white};
}

@media (max-width: ${ScreenSizes.small}) {
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 1px;
  }

  &::-webkit-scrollbar {
    background-color: rgb(255, 255, 255, 0.3);
    width: 3px;
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 1px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: ${Colors.white};
  }
}
`;

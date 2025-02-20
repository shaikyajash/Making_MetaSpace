// src/kaplayCtx.js
import kaplay from "kaplay";

const initKaplay = () => {
  const navbarHeight = 70;
  const windowHeight = window.innerHeight;
  const gameHeight = windowHeight - navbarHeight;
  const gameWidth = window.innerWidth * 0.8; // 80% of window width

  return kaplay({
    width: 1920,
    height: 1080,
    letterbox: true,
    canvas: document.getElementById("game"),
    global: false,
    debug: true,
    debugKey: "f2",
    pixelDensity: devicePixelRatio,
    canvasStyle: {
      width: '80%', // Match the CSS width
      height: `calc(100vh - ${navbarHeight}px)`,
    },
  });
};

export default initKaplay;
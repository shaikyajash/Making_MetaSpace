// src/kaplayCtx.js
import kaplay from "kaplay";

const initKaplay = () => {
  // Calculate height accounting for navbar
  const navbarHeight = 50; // Height of the navbar
  const windowHeight = window.innerHeight;
  const gameHeight = windowHeight - navbarHeight;

  return kaplay({
    width: 1920,
    height: 1080,
    letterbox: true,
    canvas: document.getElementById("game"),
    global: false,
    debug: true,
    debugKey: "f2",
    pixelDensity: devicePixelRatio,
    // Add canvas style options
    canvasStyle: {
      height: `calc(100vh - ${navbarHeight}px)`, // Subtract navbar height
      marginBottom: `${navbarHeight}px`, // Add margin for navbar
    },
  });
};

export default initKaplay;
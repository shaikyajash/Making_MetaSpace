// src/kaplayCtx.js
import kaplay from "kaplay";

const initKaplay = () => {
 
  return kaplay({
    width: 1920,
    height: 1080,
    letterbox: true,
    canvas: document.getElementById("game"),
    global: false,
    debug: true,
    debugKey: "f2",
    pixelDensity: devicePixelRatio,
    background: '#0F172A', // Hex color
    scale: 1,
   
  });
};

export default initKaplay;
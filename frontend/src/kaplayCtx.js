
import kaplay from "kaplay";

const initKaplay = () => {
  return kaplay({
    width: 1920,
    height: 1080,
    letterbox: true, // allows the canvas to scale the canvas regardless the screen size while maintaining the 1920x1080 aspect ratio

    global: false, // this makes sure that we cannot call kaplay functions globally because by default kaplay functions can be called globally

    debug: true, //TODO: put back to false in production

    debugKey: "f2", // this is the key that will be used to toggle the debug mode on and off

    canvas: document.getElementById("game"),

    pixelDensity: devicePixelRatio, // this will make sure that the canvas will be rendered in the same resolution as the screen resolution, and the graphics are sharp
  });
};

export default initKaplay;

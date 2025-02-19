import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import initGame from "./initGame";
import "./index.css";
import websocketService from './services/websocket';

const ui = document.getElementById("ui");

createRoot(ui).render(
  <StrictMode>
  </StrictMode>
);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await websocketService.connect();
    initGame();
  } catch (error) {
    console.error("Failed to start game:", error);
  }
});
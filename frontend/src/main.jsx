// src/main.jsx
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import initGame from "./initGame";
import "./index.css";
import websocketService from './services/websocket';
import App from "./App";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <App/>
  </StrictMode>
);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await websocketService.connect();
    initGame();
    const gameCanvas = document.getElementById("game");
    gameCanvas.focus(); // Ensure the canvas is focused
  } catch (error) {
    console.error("Failed to start game:", error);
  }
});
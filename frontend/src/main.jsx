// src/main.jsx
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import initGame from "./initGame";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./context/SocketConmtext";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <SocketProvider>
    <App/>
    </SocketProvider>
  </StrictMode>
);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  
    initGame();
    const gameCanvas = document.getElementById("game");
    gameCanvas.focus(); // Ensure the canvas is focused
  
});
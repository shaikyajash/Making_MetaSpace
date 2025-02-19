import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import initGame from "./initGame";
import "./index.css";
import websocketService from './services/websocket';
import App from "./App";



createRoot(root).render(
  <StrictMode>
    <App/>
    
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
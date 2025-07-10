// src/main.jsx
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import initGame from "./initGame";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./context/SocketConmtext";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);

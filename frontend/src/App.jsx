import React, { useState } from "react";
import "./App.css";
import GameScreen from "./screens/GameScreen";
import { Route, Routes } from "react-router-dom";
import Lobby from "./screens/Lobby";
import Signup from "./screens/Signup";
import Login from "./screens/Login";
import PrivateRoute from "./components/Auth/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Lobby />
          </PrivateRoute>
        }
      />
      <Route path="/room" element={<GameScreen />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;

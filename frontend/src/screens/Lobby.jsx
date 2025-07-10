import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Lobby.css"; 

const Lobby = () => {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/room");
    localStorage.setItem("room", room);
  };

  return (
    <div className="lobby-container">
      <form className="lobby-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          className="lobby-input"
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="room">Room</label>
        <input
          className="lobby-input"
          type="text"
          id="room"
          name="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          required
        />

        <button className="lobby-button" type="submit">
          Join
        </button>
      </form>
    </div>
  );
};

export default Lobby;

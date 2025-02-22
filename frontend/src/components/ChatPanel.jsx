import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ChatPanel.css";
import { useSocket } from "../context/SocketConmtext";
import { io } from "socket.io-client";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const dataChannelRef = useRef(null);
  const roomId = localStorage.getItem("room");

  const handleDataChannelOpen = useCallback(() => {
    console.log("Data channel opened");
  }, []);

  const handleDataChannelMessage = useCallback((event) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "other", text: event.data },
    ]);
  }, []);

  const handleICECandidateEvent = useCallback(
    (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    },
    [roomId]
  );

  const handleDataChannelEvent = useCallback(
    (event) => {
      const receiveChannel = event.channel;
      receiveChannel.onmessage = handleDataChannelMessage;
    },
    [handleDataChannelMessage]
  );

  const handleSocketConnect = useCallback(() => {
    console.log("Connected to server");
    socketRef.current.emit("join-room", roomId);
  }, [roomId]);

  const handleUserConnected = useCallback(
    async (userId) => {
      console.log("User connected", userId);
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", { roomId, offer });
    },
    [roomId]
  );

  const handleOffer = useCallback(
    async ({ offer }) => {
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socketRef.current.emit("answer", { roomId, answer });
    },
    [roomId]
  );

  const handleAnswer = useCallback(async ({ answer }) => {
    await pcRef.current.setRemoteDescription(answer);
  }, []);

  const handleICECandidate = useCallback(async ({ candidate }) => {
    if (candidate) {
      await pcRef.current.addIceCandidate(candidate);
    }
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    //Data channel setup for chat messages
    const dataChannel = pc.createDataChannel("chat");
    dataChannelRef.current = dataChannel;
    dataChannel.onopen = handleDataChannelOpen;
    dataChannel.onmessage = handleDataChannelMessage;

    //Socket event handlers
    socket.on("connect", handleSocketConnect);
    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleICECandidate);

    //Peer connection event handlers
    pc.onicecandidate = handleICECandidateEvent;
    pc.ondatachannel = handleDataChannelEvent;

    
  }, [
    handleDataChannelOpen,
    handleDataChannelMessage,
    handleSocketConnect,
    handleUserConnected,
    handleOffer,
    handleAnswer,
    handleICECandidate,
    handleICECandidateEvent,
    handleDataChannelEvent,
  ]);

  const sendMessage = useCallback(
    ()=>{
      if (
        dataChannelRef.current &&
        dataChannelRef.current.readyState === "open"
      ) {
        dataChannelRef.current.send(messages);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "You", text: messages },
        ]);
        setMessages("");
      } else {
        console.error("Data channel is not open");
      }

    },[messages]
  )

  return (
    <div className={`chat-panel ${isOpen ? "open" : ""}`}>
      <div className="chat-header">
        <h3>Chat</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`messages ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="messages-input">
          <input
            type="text"
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            placeholder="Type a messages..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;

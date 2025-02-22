// frontend/src/components/ChatPanel.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ChatPanel.css";
import { useSocket } from "../context/SocketConmtext";

const ChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const { socket } = useSocket();
  const roomId = localStorage.getItem("room");

  const dataChannelRef = useRef(null);
  const pcRef = useRef(null);

  // Initialize WebRTC connection
  const initializePeerConnection = useCallback(() => {
    if (!socket) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    pcRef.current = pc;
    createDataChannel();

    return pc;
  }, [socket, roomId]);

  // Create and handle data channel
  const createDataChannel = useCallback(() => {
    if (!pcRef.current) return;

    try {
      const dataChannel = pcRef.current.createDataChannel("chat", {
        ordered: true,
      });

      dataChannel.onopen = () => {
        console.log("Data channel opened");
        setIsChannelOpen(true);
      };

      dataChannel.onclose = () => {
        console.log("Data channel closed");
        setIsChannelOpen(false);
      };

      dataChannel.onmessage = (event) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "other", text: event.data },
        ]);
      };

      dataChannelRef.current = dataChannel;
    } catch (error) {
      console.error("Error creating data channel:", error);
    }
  }, []);

  // Handle receiving data channel
  const handleReceiveDataChannel = useCallback((event) => {
    const receiveChannel = event.channel;

    receiveChannel.onopen = () => {
      console.log("Receive channel opened");
      setIsChannelOpen(true);
    };

    receiveChannel.onclose = () => {
      console.log("Receive channel closed");
      setIsChannelOpen(false);
    };

    receiveChannel.onmessage = (event) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "other", text: event.data },
      ]);
    };

    dataChannelRef.current = receiveChannel;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const pc = initializePeerConnection();
    if (!pc) return;

    pc.ondatachannel = handleReceiveDataChannel;

    // Socket event handlers
    socket.on("user-connected", async (userId) => {
      try {
        console.log("User connected, creating offer");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    });

    socket.on("offer", async ({ offer }) => {
      try {
        console.log("Received offer, creating answer");
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("answer", async ({ answer }) => {
      try {
        console.log("Received answer");
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    });

    // Join the room
    socket.emit("join-room", roomId);

    return () => {
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, roomId, initializePeerConnection, handleReceiveDataChannel]);

  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!inputMessage.trim() || !isChannelOpen) return;

      try {
        if (dataChannelRef.current?.readyState === "open") {
          dataChannelRef.current.send(inputMessage);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "me", text: inputMessage },
          ]);
          setInputMessage("");
        } else {
          console.warn("Data channel is not open. Current state:", dataChannelRef.current?.readyState);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [inputMessage, isChannelOpen]
  );

  return (
    <div className={`chat-panel ${isOpen ? "open" : ""}`}>
      <div className="chat-header">
        <h3>Chat {isChannelOpen ? "(Connected)" : "(Connecting...)"}</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="message-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isChannelOpen ? "Type a message..." : "Connecting..."}
            disabled={!isChannelOpen}
          />
          <button type="submit" disabled={!isChannelOpen}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
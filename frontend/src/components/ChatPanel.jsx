import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ChatPanel.css";
import { useSocket } from "../context/SocketConmtext";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChannelOpen, setIsChannelOpen] = useState(false);

  const { socket } = useSocket();
  const roomId = localStorage.getItem("room");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);

  // Initialize Peer Connection
  const initializePeerConnection = useCallback(() => {
    if (!socket) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };

    // Handle remote track
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle data channel setup
    const dataChannel = pc.createDataChannel("chat", { ordered: true });
    setupDataChannel(dataChannel);

    return pc;
  }, [socket, roomId]);

  // Setup Data Channel
  const setupDataChannel = useCallback((channel) => {
    if (!channel) return;

    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log("Data channel opened");
      setIsChannelOpen(true);
    };

    channel.onclose = () => {
      console.log("Data channel closed");
      setIsChannelOpen(false);
    };

    channel.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: "other", text: event.data }]);
    };
  }, []);

  // Start Local Video and Send Tracks
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });

      // Create an offer with new tracks
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
    } catch (error) {
      console.error("Error starting video:", error);
    }
  };

  // Handle Receiving Data Channel
  const handleReceiveDataChannel = useCallback((event) => {
    setupDataChannel(event.channel);
  }, [setupDataChannel]);

  useEffect(() => {
    if (!socket) return;

    const pc = initializePeerConnection();
    if (!pc) return;

    pc.ondatachannel = handleReceiveDataChannel;

    // Socket event listeners
    socket.on("user-connected", async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    });

    socket.on("offer", async ({ offer }) => {
      try {
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
        console.error("Error adding ICE candidate:", error);
      }
    });

    // Join Room
    socket.emit("join-room", roomId);

    return () => {
      if (dataChannelRef.current) dataChannelRef.current.close();
      if (pcRef.current) pcRef.current.close();

      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, roomId, initializePeerConnection, handleReceiveDataChannel]);

  // Send Chat Message
  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!inputMessage.trim() || !isChannelOpen) return;

      try {
        if (dataChannelRef.current?.readyState === "open") {
          dataChannelRef.current.send(inputMessage);
          setMessages((prev) => [...prev, { sender: "me", text: inputMessage }]);
          setInputMessage("");
        } else {
          console.warn("Data channel is not open:", dataChannelRef.current?.readyState);
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
        <button className="close-button" onClick={onClose}>×</button>
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
          <button type="submit" disabled={!isChannelOpen}>Send</button>
        </form>
      </div>

      <div>
        <button onClick={startVideo}>Start Video</button>
        <br />
        <video ref={localVideoRef} autoPlay muted style={{ width: 200 }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: 200 }} />
      </div>
    </div>
  );
};

export default ChatPanel;

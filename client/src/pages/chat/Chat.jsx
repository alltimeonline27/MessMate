import { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Chat.css";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

function Chat() {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const messId = user?.mess?._id || user?.messId?._id || user?.messId;

  useEffect(() => {
    if (!messId) return;

    const loadMessages = async () => {
      try {
        const response = await api.get("/chat");

        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Failed to load chat:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to chat server");

      socket.emit("join-mess", messId);
    });

    socket.on("receive-message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [messId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || sending || !messId) return;

    setSending(true);

    try {
      const response = await api.post("/chat", {
        message: text,
      });

      const savedMessage = response.data.message;

      setMessages((prev) => [...prev, savedMessage]);

      socketRef.current?.emit("send-message", {
        messId,
        message: savedMessage.message,
        sender: user?._id || user?.id,
        senderName: user?.name,
      });

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const getSenderId = (message) => {
    if (!message?.sender) return "";

    if (typeof message.sender === "string") {
      return message.sender;
    }

    return message.sender._id;
  };

  const currentUserId = user?._id || user?.id;

  return (
    <div className="chat-page">
      <div className="chat-container">

        <div className="chat-header">
          <div>
            <h1>💬 Mess Chat</h1>
            <p>Chat with your mess members in real time</p>
          </div>

          <div className="chat-live-status">
            <span className="chat-live-dot"></span>
            Live
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="chat-empty">
              <div className="chat-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Start the conversation with your mess members.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const senderId = getSenderId(message);
              const isMine = senderId === currentUserId;

              const senderName =
                message.sender?.name ||
                message.senderName ||
                (isMine ? user?.name : "Mess Member");

              const time = message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={message._id || `${message.createdAt}-${index}`}
                  className={`chat-message-row ${
                    isMine ? "mine" : "other"
                  }`}
                >
                  <div className="chat-message">
                    {!isMine && (
                      <div className="chat-sender-name">
                        {senderName}
                      </div>
                    )}

                    <div className="chat-message-text">
                      {message.message}
                    </div>

                    <div className="chat-message-time">
                      {time}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef}></div>
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Write a message..."
            maxLength={1000}
            disabled={!messId || sending}
          />

          <button
            type="submit"
            disabled={!messageText.trim() || sending}
          >
            {sending ? "..." : "Send"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Chat;
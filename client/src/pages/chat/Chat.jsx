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

  const [openMenuId, setOpenMenuId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatPageRef = useRef(null);

  const messId = user?.mess?._id || user?.messId?._id || user?.messId;

  // ======================================================
  // LOAD CHAT + SOCKET CONNECTION
  // ======================================================
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

    // New incoming message
    socket.on("receive-message", (newMessage) => {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (message) => message._id === newMessage._id
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, newMessage];
      });
    });

    // Someone deleted a message for everyone
    socket.on("message-deleted-for-everyone", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                message: "This message was deleted",
                isDeletedForEveryone: true,
              }
            : message
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [messId]);

  // ======================================================
  // AUTO SCROLL
  // ======================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ======================================================
  // CLOSE MENUS WHEN CLICKING OUTSIDE
  // ======================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!chatPageRef.current?.contains(event.target)) {
        setOpenMenuId(null);
        setHeaderMenuOpen(false);
        return;
      }

      if (
        !event.target.closest(".chat-message-menu-wrapper") &&
        !event.target.closest(".chat-header-menu-wrapper")
      ) {
        setOpenMenuId(null);
        setHeaderMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ======================================================
  // GET SENDER ID
  // ======================================================
  const getSenderId = (message) => {
    if (!message?.sender) return "";

    if (typeof message.sender === "string") {
      return message.sender;
    }

    return message.sender._id;
  };

  const currentUserId = user?._id || user?.id;

  // ======================================================
  // DELETE FOR ME
  // ======================================================
  const deleteForMe = async (messageId) => {
    try {
      await api.delete(`/chat/${messageId}/for-me`);

      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId)
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to delete message for me:", error);
    }
  };

  // ======================================================
  // DELETE FOR EVERYONE
  // ======================================================
  const deleteForEveryone = async (messageId) => {
    const confirmed = window.confirm(
      "Delete this message for everyone?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/chat/${messageId}/for-everyone`);

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                message: "This message was deleted",
                isDeletedForEveryone: true,
              }
            : message
        )
      );

      setOpenMenuId(null);

      // Tell other users in real time
      socketRef.current?.emit("message-deleted-for-everyone", {
        messId,
        messageId,
      });
    } catch (error) {
      console.error(
        "Failed to delete message for everyone:",
        error
      );
    }
  };

  // ======================================================
  // CLEAR CHAT FOR ME
  // ======================================================
  const clearChat = async () => {
    const confirmed = window.confirm(
      "Clear all chat messages for you?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete("/chat/clear/for-me");

      setMessages([]);
      setHeaderMenuOpen(false);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  // ======================================================
  // SEND MESSAGE
  // ======================================================
  const sendMessage = async (event) => {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || sending || !messId) {
      return;
    }

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
        messageId: savedMessage._id,
      });

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="chat-page" ref={chatPageRef}>
      <div className="chat-container">

        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="chat-header">

          <div className="chat-header-left">
            <div className="chat-header-icon">💬</div>

            <div>
              <h1>Mess Chat</h1>
              <p>Chat with your mess members in real time</p>
            </div>
          </div>

          <div className="chat-header-right">

            <div className="chat-live-status">
              <span className="chat-live-dot"></span>
              Live
            </div>

            {/* HEADER MENU */}
            <div className="chat-header-menu-wrapper">
              <button
                type="button"
                className="chat-header-menu-button"
                onClick={() => {
                  setHeaderMenuOpen((prev) => !prev);
                  setOpenMenuId(null);
                }}
                aria-label="Chat options"
              >
                ⋮
              </button>

              {headerMenuOpen && (
                <div className="chat-header-dropdown">
                  <button
                    type="button"
                    onClick={clearChat}
                  >
                    🗑️ Clear chat
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ==================================================
            MESSAGES
        ================================================== */}
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

              <p>
                Start the conversation with your mess members.
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const senderId = getSenderId(message);

              const isMine =
                senderId?.toString() ===
                currentUserId?.toString();

              const isDeleted =
                message.isDeletedForEveryone === true;

              const senderName =
                message.sender?.name ||
                message.senderName ||
                (isMine ? user?.name : "Mess Member");

              const time = message.createdAt
                ? new Date(
                    message.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={
                    message._id ||
                    `${message.createdAt}-${index}`
                  }
                  className={`chat-message-row ${
                    isMine ? "mine" : "other"
                  }`}
                >

                  <div
                    className={`chat-message ${
                      isDeleted
                        ? "deleted-message"
                        : ""
                    }`}
                  >

                    {/* SENDER NAME */}
                    {!isMine && (
                      <div className="chat-sender-name">
                        {senderName}
                      </div>
                    )}

                    {/* MESSAGE CONTENT */}
                    <div
                      className={`chat-message-content ${
                        isDeleted
                          ? "deleted-content"
                          : ""
                      }`}
                    >
                      <div className="chat-message-text">
                        {message.message}
                      </div>

                      {/* MESSAGE MENU */}
                      {!isDeleted && (
                        <div className="chat-message-menu-wrapper">

                          <button
                            type="button"
                            className="chat-message-menu-button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenuId((prev) =>
                                prev === message._id
                                  ? null
                                  : message._id
                              );

                              setHeaderMenuOpen(false);
                            }}
                            aria-label="Message options"
                          >
                            ⋮
                          </button>

                          {openMenuId === message._id && (
                            <div className="chat-message-dropdown">

                              <button
                                type="button"
                                onClick={() =>
                                  deleteForMe(
                                    message._id
                                  )
                                }
                              >
                                🗑️ Delete for me
                              </button>

                              {isMine && (
                                <button
                                  type="button"
                                  className="danger-option"
                                  onClick={() =>
                                    deleteForEveryone(
                                      message._id
                                    )
                                  }
                                >
                                  🗑️ Delete for everyone
                                </button>
                              )}

                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {/* TIME */}
                    <div className="chat-message-time">
                      {isDeleted
                        ? "Deleted"
                        : time}
                    </div>

                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* ==================================================
            INPUT
        ================================================== */}
        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >
          <input
            type="text"
            value={messageText}
            onChange={(event) =>
              setMessageText(event.target.value)
            }
            placeholder="Write a message..."
            maxLength={1000}
            disabled={!messId || sending}
          />

          <button
            type="submit"
            disabled={
              !messageText.trim() ||
              sending
            }
          >
            {sending ? "..." : "Send"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Chat;
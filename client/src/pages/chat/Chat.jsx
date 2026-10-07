import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Chat.css";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const EMOJIS = [
  "😀", "😂", "🤣", "😊", "😍", "🥰",
  "😘", "😎", "🤩", "😅", "😭", "😢",
  "😡", "🤔", "😴", "👍", "👎", "👏",
  "🙏", "❤️", "🔥", "🎉", "😂", "😁",
  "🙌", "💯", "✨", "😇", "🤝", "🍽️",
];

function Chat() {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatPageRef = useRef(null);
  const typingTimerRef = useRef(null);

  const messId =
    user?.mess?._id ||
    user?.messId?._id ||
    user?.messId;

  const currentUserId = user?._id || user?.id;

  // ======================================================
  // LOAD CHAT + SOCKET
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
      socket.emit("join-mess", {
        messId,
        userId: currentUserId,
        userName: user?.name,
      });
    });

    socket.on("receive-message", (newMessage) => {
      setMessages((prev) => {
        if (
          newMessage?._id &&
          prev.some(
            (message) =>
              message._id === newMessage._id
          )
        ) {
          return prev;
        }

        return [...prev, newMessage];
      });
    });

    socket.on(
      "message-deleted-for-everyone",
      ({ messageId }) => {
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? {
                  ...message,
                  message:
                    "This message was deleted",
                  isDeletedForEveryone: true,
                }
              : message
          )
        );
      }
    );

    socket.on("presence-update", ({ users }) => {
      setOnlineUsers(users || []);
    });

    socket.on(
      "user-typing",
      ({ userId, userName, isTyping }) => {
        if (
          userId?.toString() ===
          currentUserId?.toString()
        ) {
          return;
        }

        setTypingUsers((prev) => {
          const next = { ...prev };

          if (isTyping) {
            next[userId] =
              userName || "Mess Member";
          } else {
            delete next[userId];
          }

          return next;
        });
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [messId, currentUserId, user?.name]);

  // ======================================================
  // AUTO SCROLL
  // ======================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ======================================================
  // CLOSE MENUS OUTSIDE
  // ======================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!chatPageRef.current?.contains(event.target)) {
        setOpenMenuId(null);
        setHeaderMenuOpen(false);
        setEmojiOpen(false);
        return;
      }

      if (
        !event.target.closest(
          ".chat-message-menu-wrapper"
        ) &&
        !event.target.closest(
          ".chat-header-menu-wrapper"
        )
      ) {
        setOpenMenuId(null);
        setHeaderMenuOpen(false);
      }

      if (
        !event.target.closest(".chat-emoji-wrapper") &&
        !event.target.closest(".chat-input-area")
      ) {
        setEmojiOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ======================================================
  // SENDER HELPERS
  // ======================================================
  const getSenderId = (message) => {
    if (!message?.sender) return "";

    if (typeof message.sender === "string") {
      return message.sender;
    }

    return message.sender._id;
  };

  const getSenderName = (message) => {
    return (
      message?.sender?.name ||
      message?.senderName ||
      "Mess Member"
    );
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(
      (onlineUser) =>
        onlineUser.userId?.toString() ===
        userId?.toString()
    );
  };

  // ======================================================
  // SEARCH
  // ======================================================
  const visibleMessages = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) return messages;

    return messages.filter((message) => {
      const text =
        message?.message?.toLowerCase() || "";

      const sender =
        getSenderName(message).toLowerCase();

      return (
        text.includes(query) ||
        sender.includes(query)
      );
    });
  }, [messages, searchText]);

  // ======================================================
  // TYPING
  // ======================================================
  const handleTyping = (event) => {
    const value = event.target.value;

    setMessageText(value);

    if (!messId || !currentUserId) return;

    socketRef.current?.emit("typing", {
      messId,
      userId: currentUserId,
      userName: user?.name,
      isTyping: Boolean(value.trim()),
    });

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", {
        messId,
        userId: currentUserId,
        userName: user?.name,
        isTyping: false,
      });
    }, 900);
  };

  // ======================================================
  // EMOJI
  // ======================================================
  const addEmoji = (emoji) => {
    setMessageText((prev) => `${prev}${emoji}`);
    setEmojiOpen(false);
  };

  // ======================================================
  // REPLY
  // ======================================================
  const startReply = (message) => {
    if (!message || message.isDeletedForEveryone) {
      return;
    }

    setReplyTo(message);
    setOpenMenuId(null);

    setTimeout(() => {
      document
        .querySelector(".chat-message-input")
        ?.focus();
    }, 0);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  // ======================================================
  // DELETE FOR ME
  // ======================================================
  const deleteForMe = async (messageId) => {
    try {
      await api.delete(
        `/chat/${messageId}/for-me`
      );

      setMessages((prev) =>
        prev.filter(
          (message) =>
            message._id !== messageId
        )
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Failed to delete message for me:",
        error
      );
    }
  };

  // ======================================================
  // DELETE FOR EVERYONE
  // ======================================================
  const deleteForEveryone = async (messageId) => {
    const confirmed = window.confirm(
      "Delete this message for everyone?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/chat/${messageId}/for-everyone`
      );

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                message:
                  "This message was deleted",
                isDeletedForEveryone: true,
              }
            : message
        )
      );

      socketRef.current?.emit(
        "message-deleted-for-everyone",
        {
          messId,
          messageId,
        }
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Failed to delete message for everyone:",
        error
      );
    }
  };

  // ======================================================
  // CLEAR CHAT
  // ======================================================
  const clearChat = async () => {
    const confirmed = window.confirm(
      "Clear all chat messages for you?"
    );

    if (!confirmed) return;

    try {
      await api.delete("/chat/clear/for-me");

      setMessages([]);
      setHeaderMenuOpen(false);
      setOpenMenuId(null);
      setSearchText("");
    } catch (error) {
      console.error(
        "Failed to clear chat:",
        error
      );
    }
  };

  // ======================================================
  // SEND
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
        replyTo: replyTo?._id || null,
      });

      const savedMessage = response.data.message;

      setMessages((prev) => [
        ...prev,
        savedMessage,
      ]);

      socketRef.current?.emit("send-message", {
        messId,
        messageData: savedMessage,
      });

      socketRef.current?.emit("typing", {
        messId,
        userId: currentUserId,
        userName: user?.name,
        isTyping: false,
      });

      setMessageText("");
      setReplyTo(null);
      setEmojiOpen(false);
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  // ======================================================
  // TYPING TEXT
  // ======================================================
  const typingNames = Object.values(
    typingUsers
  );

  let typingText = "";

  if (typingNames.length === 1) {
    typingText = `${typingNames[0]} is typing…`;
  } else if (typingNames.length === 2) {
    typingText = `${typingNames[0]} and ${typingNames[1]} are typing…`;
  } else if (typingNames.length > 2) {
    typingText = `${typingNames.length} people are typing…`;
  }

  return (
    <div
      className="chat-page"
      ref={chatPageRef}
    >
      <div className="chat-container">

        {/* HEADER */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon">
              💬
            </div>

            <div>
              <h1>Mess Chat</h1>

              <p>
                Chat with your mess members in
                real time
              </p>

              <div className="chat-presence-line">
                <span className="chat-online-dot"></span>
                {onlineUsers.length} online
              </div>
            </div>
          </div>

          <div className="chat-header-right">

            <button
              type="button"
              className="chat-search-button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                setHeaderMenuOpen(false);
              }}
              title="Search chat"
            >
              🔎
            </button>

            <div className="chat-live-status">
              <span className="chat-live-dot"></span>
              Live
            </div>

            <div className="chat-header-menu-wrapper">
              <button
                type="button"
                className="chat-header-menu-button"
                onClick={() => {
                  setHeaderMenuOpen(
                    (prev) => !prev
                  );
                  setOpenMenuId(null);
                }}
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

        {/* SEARCH */}
        {searchOpen && (
          <div className="chat-search-bar">
            <span>🔎</span>

            <input
              autoFocus
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search messages..."
            />

            {searchText && (
              <span className="chat-search-count">
                {visibleMessages.length}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchText("");
                setSearchOpen(false);
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* MESSAGES */}
        <div className="chat-messages">
          {loading ? (
            <div className="chat-empty">
              <div className="chat-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : visibleMessages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                {searchText
                  ? "🔎"
                  : "💬"}
              </div>

              <h3>
                {searchText
                  ? "No messages found"
                  : "No messages yet"}
              </h3>

              <p>
                {searchText
                  ? "Try another search."
                  : "Start the conversation with your mess members."}
              </p>
            </div>
          ) : (
            visibleMessages.map(
              (message, index) => {
                const senderId =
                  getSenderId(message);

                const isMine =
                  senderId?.toString() ===
                  currentUserId?.toString();

                const isDeleted =
                  message.isDeletedForEveryone ===
                  true;

                const senderName =
                  getSenderName(message);

                const time =
                  message.createdAt
                    ? new Date(
                        message.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "";

                return (
                  <div
                    key={
                      message._id ||
                      `${message.createdAt}-${index}`
                    }
                    className={`chat-message-row ${
                      isMine
                        ? "mine"
                        : "other"
                    }`}
                  >
                    <div
                      className={`chat-message ${
                        isDeleted
                          ? "deleted-message"
                          : ""
                      }`}
                    >
                      {!isMine && (
                        <div className="chat-sender-name-row">
                          <span className="chat-sender-name">
                            {senderName}
                          </span>

                          <span
                            className={`chat-user-status ${
                              isUserOnline(
                                senderId
                              )
                                ? "online"
                                : "offline"
                            }`}
                          >
                            {isUserOnline(
                              senderId
                            )
                              ? "● Online"
                              : "● Offline"}
                          </span>
                        </div>
                      )}

                      {message.replyTo &&
                        !isDeleted && (
                          <div className="chat-reply-preview">
                            <strong>
                              Replying to{" "}
                              {message.replyTo
                                .sender
                                ?.name ||
                                "message"}
                            </strong>

                            <span>
                              {message.replyTo
                                .isDeletedForEveryone
                                ? "This message was deleted"
                                : message.replyTo
                                    .message}
                            </span>
                          </div>
                        )}

                      <div className="chat-message-content">
                        <div className="chat-message-text">
                          {message.message}
                        </div>

                        {!isDeleted && (
                          <div className="chat-message-menu-wrapper">
                            <button
                              type="button"
                              className="chat-message-menu-button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                setOpenMenuId(
                                  (prev) =>
                                    prev ===
                                    message._id
                                      ? null
                                      : message._id
                                );

                                setHeaderMenuOpen(
                                  false
                                );
                              }}
                            >
                              ⋮
                            </button>

                            {openMenuId ===
                              message._id && (
                              <div className="chat-message-dropdown">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startReply(
                                      message
                                    )
                                  }
                                >
                                  ↩️ Reply
                                </button>

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

                      <div className="chat-message-time">
                        {isDeleted
                          ? "Deleted"
                          : time}
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* TYPING */}
        {typingText && (
          <div className="chat-typing-indicator">
            <span className="typing-dots">
              <i></i>
              <i></i>
              <i></i>
            </span>

            {typingText}
          </div>
        )}

        {/* REPLY BAR */}
        {replyTo && (
          <div className="chat-reply-bar">
            <div>
              <strong>
                Replying to{" "}
                {getSenderName(replyTo)}
              </strong>

              <span>
                {replyTo.message}
              </span>
            </div>

            <button
              type="button"
              onClick={cancelReply}
            >
              ×
            </button>
          </div>
        )}

        {/* INPUT */}
        <form
          className="chat-input-area"
          onSubmit={sendMessage}
        >
          <div className="chat-emoji-wrapper">
            <button
              type="button"
              className="chat-emoji-button"
              onClick={() =>
                setEmojiOpen(
                  (prev) => !prev
                )
              }
            >
              😊
            </button>

            {emojiOpen && (
              <div className="chat-emoji-picker">
                {EMOJIS.map(
                  (emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      onClick={() =>
                        addEmoji(emoji)
                      }
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <input
            className="chat-message-input"
            type="text"
            value={messageText}
            onChange={handleTyping}
            placeholder={
              replyTo
                ? "Write a reply..."
                : "Write a message..."
            }
            maxLength={1000}
            disabled={
              !messId || sending
            }
          />

          <button
            type="submit"
            disabled={
              !messageText.trim() ||
              sending
            }
          >
            {sending
              ? "..."
              : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;

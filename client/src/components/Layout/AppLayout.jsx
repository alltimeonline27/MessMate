import { useContext, useEffect, useState } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { io } from "socket.io-client";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { LanguageContext } from "../../context/LanguageContext";

import "./AppLayout.css";

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useContext(AuthContext);

    const { theme, toggleTheme } = useContext(ThemeContext);

    const { language, changeLanguage } =
        useContext(LanguageContext);

    const messId =
        user?.mess?._id ||
        user?.messId?._id ||
        user?.messId;

    const socketUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000";

    /*
     * ==========================================
     * UNREAD CHAT COUNT + SOCKET
     * ==========================================
     */

    useEffect(() => {
        if (!messId || !user?._id) {
            return;
        }

        const storageKey =
            `messmate_unread_chat_count_${messId}`;

        const socket = io(socketUrl, {
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            socket.emit("join-mess", {
                messId,
                userId: user._id,
                userName: user.name,
            });
        });

        const handleReceiveMessage = () => {
            /*
             * If user is already inside Chat page,
             * don't increase unread count.
             */
            if (window.location.pathname === "/chat") {
                return;
            }

            setUnreadChatCount((prevCount) => {
                const savedCount = Number(
                    localStorage.getItem(storageKey) || 0
                );

                const currentCount = Math.max(
                    prevCount,
                    savedCount
                );

                const nextCount = currentCount + 1;

                localStorage.setItem(
                    storageKey,
                    String(nextCount)
                );

                return nextCount;
            });
        };

        socket.on(
            "receive-message",
            handleReceiveMessage
        );

        return () => {
            socket.off(
                "receive-message",
                handleReceiveMessage
            );

            socket.disconnect();
        };
    }, [
        messId,
        user?._id,
        user?.name,
        socketUrl,
    ]);

    /*
     * When user opens Chat page,
     * clear unread count from localStorage.
     *
     * No setState inside this effect,
     * so ESLint react-hooks/set-state-in-effect
     * error will not happen.
     */
    useEffect(() => {
        if (!messId) {
            return;
        }

        if (location.pathname === "/chat") {
            const storageKey =
                `messmate_unread_chat_count_${messId}`;

            localStorage.setItem(storageKey, "0");
        }
    }, [location.pathname, messId]);

    /*
     * ==========================================
     * CURRENT DISPLAYED UNREAD COUNT
     * ==========================================
     */

    const storageKey = messId
        ? `messmate_unread_chat_count_${messId}`
        : null;

    const storedUnreadCount = storageKey
        ? Number(
            localStorage.getItem(storageKey) || 0
        )
        : 0;

    const displayedUnreadChatCount =
        Math.max(
            unreadChatCount,
            storedUnreadCount
        );

    /*
     * ==========================================
     * OPEN CHAT
     * ==========================================
     */

    const openChat = () => {
        if (messId) {
            const storageKey =
                `messmate_unread_chat_count_${messId}`;

            localStorage.setItem(
                storageKey,
                "0"
            );
        }

        setUnreadChatCount(0);

        navigate("/chat");
    };

    /*
     * ==========================================
     * SIDEBAR ITEMS
     * ==========================================
     */

    const sidebarItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: "⌂",
        },
        {
            label: "Members",
            path: "/members",
            icon: "♙",
        },
        {
            label: "Meal Poll",
            path: "/meal-poll",
            icon: "◉",
        },
        {
            label: "Menu",
            path: "/menu",
            icon: "🍽️",
        },
        {
            label: "General Polls",
            path: "/general-polls",
            icon: "◌",
        },
        {
            label: "Meal History",
            path: "/meal-history",
            icon: "◷",
        },
        {
            label: "Bazar",
            path: "/bazar",
            icon: "🛒",
        },
        {
            label: "Bazar Schedule",
            path: "/bazar-schedule",
            icon: "▣",
        },
        {
            label: "Expenses",
            path: "/expenses",
            icon: "₹",
        },
        {
            label: "Payments",
            path: "/payments",
            icon: "▤",
        },
        {
            label: "Reports",
            path: "/reports",
            icon: "▥",
        },
        {
            label: "Invites",
            path: "/invites",
            icon: "↗",
        },
        {
            label: "Join Requests",
            path: "/join-requests",
            icon: "＋",
        },
    ];

    /*
     * ==========================================
     * SIDEBAR
     * ==========================================
     */

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    /*
     * ==========================================
     * LOGOUT
     * ==========================================
     */

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    /*
     * ==========================================
     * UI
     * ==========================================
     */

    return (
        <div className="app-shell">

            {/* =========================
                TOP NAVBAR
            ========================== */}

            <header className="top-navbar">

                <div className="navbar-left">

                    <button
                        className="brand"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        <span className="brand-mark">
                            M
                        </span>

                        <span className="brand-name">
                            Mess<span>Mate</span>
                        </span>
                    </button>

                </div>

                <div className="navbar-actions">

                    {/* Theme */}

                    <button
                        className="navbar-icon-button"
                        onClick={toggleTheme}
                        title={
                            theme === "light"
                                ? "Dark mode"
                                : "Light mode"
                        }
                        aria-label="Toggle theme"
                    >
                        {theme === "light"
                            ? "🌙"
                            : "☀️"}
                    </button>

                    {/* Language */}

                    <select
                        className="language-selector"
                        value={language}
                        onChange={(event) =>
                            changeLanguage(
                                event.target.value
                            )
                        }
                        aria-label="Language"
                    >
                        <option value="en">
                            EN
                        </option>

                        <option value="bn">
                            বাংলা
                        </option>
                    </select>

                    {/* Notifications */}

                    <button
                        className="navbar-icon-button"
                        onClick={() =>
                            navigate(
                                "/notifications"
                            )
                        }
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        🔔
                    </button>

                    {/* Settings */}

                    <button
                        className="navbar-icon-button"
                        onClick={() =>
                            navigate(
                                "/mess-settings"
                            )
                        }
                        title="Settings"
                        aria-label="Settings"
                    >
                        ⚙
                    </button>

                    {/* Profile */}

                    <button
                        className="profile-button"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <span
                            className="profile-avatar"
                            aria-hidden="true"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    cx="12"
                                    cy="8"
                                    r="3.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />

                                <path
                                    d="M5.5 19.5C6.2 15.8 8.4 14 12 14C15.6 14 17.8 15.8 18.5 19.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>

                        <span className="profile-text">
                            <strong>
                                Profile
                            </strong>

                            <small>
                                Account
                            </small>
                        </span>
                    </button>

                    {/* Mobile Menu */}

                    <button
                        className="mobile-menu-button"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        aria-label="Open menu"
                        title="Open menu"
                    >
                        ☰
                    </button>

                </div>
            </header>

            {/* =========================
                MOBILE OVERLAY
            ========================== */}

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            {/* =========================
                RIGHT SIDEBAR
            ========================== */}

            <aside
                className={`app-sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                <div className="sidebar-header">

                    <div>

                        <p className="sidebar-label">
                            MENU
                        </p>

                        <h2>
                            MessMate
                        </h2>

                    </div>

                    <button
                        className="sidebar-close"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        ×
                    </button>

                </div>

                {/* Sidebar Navigation */}

                <nav className="sidebar-nav">

                    {sidebarItems.map(
                        (item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={
                                    closeSidebar
                                }
                                className={({
                                    isActive,
                                }) =>
                                    `sidebar-link ${
                                        isActive
                                            ? "sidebar-link-active"
                                            : ""
                                    }`
                                }
                            >
                                <span className="sidebar-icon">
                                    {item.icon}
                                </span>

                                <span>
                                    {item.label}
                                </span>
                            </NavLink>
                        )
                    )}

                </nav>

                {/* Sidebar Bottom */}

                <div className="sidebar-bottom">

                    <div className="sidebar-tip">

                        {/* CHAT BUTTON */}

                        <button
                            type="button"
                            className="chat-sidebar-button"
                            onClick={openChat}
                        >
                            <span>
                                💬 Chat
                            </span>

                            {location.pathname !==
                                "/chat" &&
                                displayedUnreadChatCount >
                                    0 && (
                                    <span className="chat-unread-badge">
                                        {displayedUnreadChatCount >
                                        99
                                            ? "99+"
                                            : displayedUnreadChatCount}
                                    </span>
                                )}
                        </button>

                    </div>

                    {/* Logout */}

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>
                            ↪
                        </span>

                        Logout
                    </button>

                </div>

            </aside>

            {/* =========================
                MAIN CONTENT
            ========================== */}

            <main className="app-main">

                <div className="app-content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}

export default AppLayout;
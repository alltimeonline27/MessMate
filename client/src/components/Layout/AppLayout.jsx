import { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AppLayout.css";



function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const { theme, toggleTheme } =
        useContext(ThemeContext);

    const { language, changeLanguage } =
        useContext(LanguageContext);

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

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="app-shell">
            {/* =========================
          TOP NAVBAR
      ========================== */}
            <header className="top-navbar">
                <div className="navbar-left">


                    <button
                        className="brand"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span className="brand-mark">M</span>

                        <span className="brand-name">
                            Mess<span>Mate</span>
                        </span>
                    </button>
                </div>

                <div className="navbar-actions">
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
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>

                    <select
                        className="language-selector"
                        value={language}
                        onChange={(event) =>
                            changeLanguage(event.target.value)
                        }
                        aria-label="Language"
                    >
                        <option value="en">EN</option>
                        <option value="bn">বাংলা</option>
                    </select>
                    <button
                        className="navbar-icon-button"
                        onClick={() => navigate("/notifications")}
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        🔔
                    </button>

                    <button
                        className="navbar-icon-button"
                        onClick={() => navigate("/mess-settings")}
                        title="Settings"
                        aria-label="Settings"
                    >
                        ⚙
                    </button>

                    <button
                        className="profile-button"
                        onClick={() => navigate("/profile")}
                    >
                        <span className="profile-avatar" aria-hidden="true">
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
                            <strong>Profile</strong>
                            <small>Account</small>
                        </span>
                    </button>
                    <button
                        className="mobile-menu-button"
                        onClick={() => setSidebarOpen(true)}
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
                className={`app-sidebar ${sidebarOpen ? "sidebar-open" : ""
                    }`}
            >
                <div className="sidebar-header">
                    <div>
                        <p className="sidebar-label">
                            MENU
                        </p>

                        <h2>MessMate</h2>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        ×
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "sidebar-link-active" : ""
                                }`
                            }
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-tip">
                        <span className="tip-icon">✦</span>

                        <div>
                            <strong>MessMate</strong>
                            <p>
                                Manage your mess smarter.
                            </p>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
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
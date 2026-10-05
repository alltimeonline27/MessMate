import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Members", path: "/members" },
    { label: "Meal Poll", path: "/meal-poll" },
    { label: "General Polls", path: "/general-polls" },
    { label: "Meal History", path: "/meal-history" },
    { label: "Bazar", path: "/bazar" },
    { label: "Bazar Schedule", path: "/bazar-schedule" },
    { label: "Expenses", path: "/expenses" },
    { label: "Payments", path: "/payments" },
    { label: "Reports", path: "/reports" },
    { label: "Notifications", path: "/notifications" },
    { label: "Profile", path: "/profile" },
    
  ];

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "calc(100vh - 70px)",
        backgroundColor: "#111827",
        padding: "20px 15px",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ color: "white", marginBottom: "25px" }}>
        Menu
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            style={{
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
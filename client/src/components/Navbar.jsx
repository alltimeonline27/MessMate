function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        padding: "15px 30px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0, color: "#2563eb" }}>MessMate</h2>

      <div>
        <button
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
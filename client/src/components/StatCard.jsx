function StatCard({ title, value, icon }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "10px" }}>
        {icon}
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          color: "#6b7280",
          fontSize: "15px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: "bold",
          color: "#111827",
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default StatCard;
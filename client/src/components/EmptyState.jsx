function EmptyState({ message = "No data available." }) {
  return (
    <div
      style={{
        padding: "30px",
        textAlign: "center",
        color: "#6b7280",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
      }}
    >
      <h3>Nothing here yet</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
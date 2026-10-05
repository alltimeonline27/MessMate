function ExpenseCard({ title, amount, category, date }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
      }}
    >
      <h3>{title}</h3>

      <p>
        <strong>Amount:</strong> ₹{amount}
      </p>

      <p>
        <strong>Category:</strong> {category}
      </p>

      <p>
        <strong>Date:</strong> {date}
      </p>
    </div>
  );
}

export default ExpenseCard;
function MealPollCard({ mealType, yesVotes, noVotes }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
      }}
    >
      <h3>
        🍽️ Tomorrow's {mealType}
      </h3>

      <p>Will you eat {mealType} tomorrow?</p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button>YES</button>
        <button>NO</button>
      </div>

      <p>Yes Votes: {yesVotes}</p>
      <p>No Votes: {noVotes}</p>
    </div>
  );
}

export default MealPollCard;
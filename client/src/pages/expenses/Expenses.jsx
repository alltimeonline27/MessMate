import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "./Expenses.css";

function Expenses() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});

  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [category, setCategory] = useState("gas");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/expenses");

      if (response.data.success) {
        setExpenses(response.data.expenses || []);
        setTotalExpense(response.data.totalExpense || 0);
      }
    } catch (error) {
      console.error(
        "Failed to load expenses:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message || "Failed to load expenses"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const response = await api.get("/expenses/summary");

      if (response.data.success) {
        setCategoryTotals(response.data.categoryTotals || {});
      }
    } catch (error) {
      console.error(
        "Failed to load expense summary:",
        error.response?.data || error.message
      );
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExpenses();

    
    loadSummary();
  }, [loadExpenses, loadSummary]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.post("/expenses", {
        date,
        category,
        description,
        amount: Number(amount),
        note,
      });

      if (response.data.success) {
        setMessage("Expense added successfully.");

        setDescription("");
        setAmount("");
        setNote("");

        await loadExpenses();
        await loadSummary();
      }
    } catch (error) {
      console.error(
        "Failed to add expense:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message || "Failed to add expense"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await api.delete(`/expenses/${id}`);

      if (response.data.success) {
        setMessage("Expense deleted successfully.");

        await loadExpenses();
        await loadSummary();
      }
    } catch (error) {
      console.error(
        "Failed to delete expense:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message || "Failed to delete expense"
      );
    }
  };

  const formatCategory = (value) => {
    if (!value) return "";

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const categoryIcon = (value) => {
    const icons = {
      gas: "🔥",
      electricity: "⚡",
      rent: "🏠",
      maintenance: "🔧",
      water: "💧",
      cleaning: "🧹",
      other: "•••",
    };

    return icons[value] || "₹";
  };

  return (
    <div className="expenses-page">
      {/* HEADER */}

      <section className="expenses-header">
        <div>
          <span className="expenses-eyebrow">MESS MANAGEMENT</span>

          <h1>Other Expenses</h1>

          <p>
            Manage and view non-bazar expenses of your mess.
          </p>
        </div>

        <div className="expenses-total-mini">
          <div className="expenses-total-icon">₹</div>

          <div>
            <span>Total Expenses</span>
            <strong>₹{Number(totalExpense).toFixed(2)}</strong>
          </div>
        </div>
      </section>

      {/* MESSAGE */}

      {(message || error) && (
        <div
          className={`expenses-alert ${message
              ? "expenses-alert-success"
              : "expenses-alert-error"
            }`}
        >
          <span className="expenses-alert-icon">
            {message ? "✓" : "!"}
          </span>

          <span>{message || error}</span>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <section className="expenses-summary-grid">
        <div className="expense-summary-card expense-summary-main">
          <div className="expense-summary-icon">₹</div>

          <div>
            <span>Total Other Expenses</span>
            <strong>₹{Number(totalExpense).toFixed(2)}</strong>
          </div>
        </div>

        {Object.entries(categoryTotals).map(
          ([categoryName, value]) => (
            <div
              className="expense-summary-card"
              key={categoryName}
            >
              <div className="expense-summary-icon">
                {categoryIcon(categoryName)}
              </div>

              <div>
                <span>{formatCategory(categoryName)}</span>
                <strong>₹{Number(value).toFixed(2)}</strong>
              </div>
            </div>
          )
        )}
      </section>

      {/* ADMIN FORM */}

      {isAdmin && (
        <section className="expense-form-card">
          <div className="expense-section-heading">
            <div>
              <span className="expenses-card-eyebrow">ADMIN</span>

              <h2>Add Expense</h2>

              <p>
                Record a non-bazar expense for your mess.
              </p>
            </div>

            <div className="expense-section-icon">+</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="expense-form-grid">
              <div className="expense-field">
                <label htmlFor="expense-date">Date</label>

                <div className="expense-input-wrap">
                  <span>▣</span>

                  <input
                    id="expense-date"
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="expense-field">
                <label htmlFor="expense-category">
                  Category
                </label>

                <div className="expense-input-wrap">
                  <span>{categoryIcon(category)}</span>

                  <select
                    id="expense-category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  >
                    <option value="gas">Gas</option>
                    <option value="electricity">
                      Electricity
                    </option>
                    <option value="rent">Rent</option>
                    <option value="maintenance">
                      Maintenance
                    </option>
                    <option value="water">Water</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="expense-field">
                <label htmlFor="expense-description">
                  Description
                </label>

                <div className="expense-input-wrap">
                  <span>✎</span>

                  <input
                    id="expense-description"
                    type="text"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Example: LPG cylinder"
                    required
                  />
                </div>
              </div>

              <div className="expense-field">
                <label htmlFor="expense-amount">
                  Amount
                </label>

                <div className="expense-input-wrap expense-amount-input">
                  <span>₹</span>

                  <input
                    id="expense-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div className="expense-field expense-field-full">
                <label htmlFor="expense-note">Note</label>

                <div className="expense-input-wrap expense-textarea-wrap">
                  <span>▤</span>

                  <textarea
                    id="expense-note"
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    placeholder="Optional note"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="expense-form-footer">
              <span>
                All expense information will be saved to your
                mess records.
              </span>

              <button
                type="submit"
                className="expense-submit-btn"
                disabled={saving}
              >
                <span>+</span>

                {saving ? "Saving..." : "Add Expense"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* EXPENSE HISTORY */}

      <section className="expense-history-card">
        <div className="expense-history-header">
          <div>
            <span className="expenses-card-eyebrow">
              YOUR RECORD
            </span>

            <h2>Expense History</h2>

            <p>
              View all non-bazar expenses recorded for your
              mess.
            </p>
          </div>

          <button
            type="button"
            className="expense-refresh-btn"
            onClick={() => {
              loadExpenses();
              loadSummary();
            }}
          >
            ↻ <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="expense-empty-state">
            <div className="expense-loading-icon">◌</div>
            <strong>Loading expenses...</strong>
          </div>
        ) : expenses.length === 0 ? (
          <div className="expense-empty-state">
            <div className="expense-empty-icon">₹</div>

            <strong>No expenses found</strong>

            <p>
              No other expenses have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="expense-table-wrapper">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Added By</th>
                  <th>Note</th>

                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>
                      <span className="expense-date">
                        {new Date(
                          expense.date
                        ).toLocaleDateString()}
                      </span>
                    </td>

                    <td>
                      <span className="expense-category-badge">
                        <span>
                          {categoryIcon(expense.category)}
                        </span>

                        {formatCategory(expense.category)}
                      </span>
                    </td>

                    <td>
                      <strong className="expense-description">
                        {expense.description}
                      </strong>
                    </td>

                    <td>
                      <strong className="expense-amount">
                        ₹{Number(expense.amount).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <span className="expense-added-by">
                        {expense.addedBy?.name || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="expense-note">
                        {expense.note || "—"}
                      </span>
                    </td>

                    {isAdmin && (
                      <td>
                        <button
                          type="button"
                          className="expense-delete-btn"
                          onClick={() =>
                            handleDelete(expense._id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Expenses;
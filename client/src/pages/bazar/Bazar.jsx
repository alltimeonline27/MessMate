import { useEffect, useState } from "react";
import api from "../../services/api";

import "./Bazar.css";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M7 3.5V7M17 3.5V7M3.5 9.5H20.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M3.5 4H5l1.7 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.5L20.5 8H6" />
      <circle cx="9" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.5c-.5-.7-1.3-1-2.4-1-1.2 0-2.1.6-2.1 1.5 0 2.5 4.9 1 4.9 3.7 0 .9-.9 1.7-2.4 1.7-1.2 0-2.2-.4-2.8-1.2M12 7v10" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}



function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function Bazar() {
  const [bazars, setBazars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    items: "",
    amount: "",
    note: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchBazars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bazar");

      setBazars(response.data.bazars || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load bazar entries"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchBazars();
}, []);

  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, error]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateBazar = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await api.post("/bazar", {
        date: formData.date,
        items: formData.items,
        amount: Number(formData.amount),
        note: formData.note,
      });

      setMessage(
        response.data.message ||
          "Bazar entry created successfully"
      );

      setFormData({
        date: "",
        items: "",
        amount: "",
        note: "",
      });

      await fetchBazars();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create bazar entry"
      );
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalAmount = bazars.reduce(
    (total, bazar) =>
      total + Number(bazar.amount || 0),
    0
  );

  const averageAmount =
    bazars.length > 0
      ? totalAmount / bazars.length
      : 0;

  if (loading) {
    return (
      <div className="bazar-page">
        <div className="bazar-loading-card">
          <div className="bazar-loading-spinner" />
          <p>Loading bazar entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bazar-page">
      <div className="bazar-container">

        {/* =========================================
            HEADER
            ========================================= */}

        <section className="bazar-heading">
          <div>
            <span className="bazar-eyebrow">
              MESS MANAGEMENT
            </span>

            <h1>Bazar</h1>

            <p>
              Track daily shopping and bazar expenses
              of your mess.
            </p>
          </div>

          <div className="bazar-total-badge">
            <div className="bazar-total-icon">
              <MoneyIcon />
            </div>

            <div>
              <span>Total Bazar Expense</span>
              <strong>
                ₹{totalAmount.toFixed(2)}
              </strong>
            </div>
          </div>
        </section>


        {/* =========================================
            TOAST
            ========================================= */}

        <div className="bazar-toast-container">
          {message && (
            <div className="bazar-toast bazar-toast-success">
              <div className="bazar-toast-icon">
                <CheckIcon />
              </div>

              <div className="bazar-toast-content">
                <strong>Success</strong>
                <span>{message}</span>
              </div>

              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Close notification"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          {error && (
            <div className="bazar-toast bazar-toast-error">
              <div className="bazar-toast-icon">
                !
              </div>

              <div className="bazar-toast-content">
                <strong>Something went wrong</strong>
                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Close notification"
              >
                <CloseIcon />
              </button>
            </div>
          )}
        </div>


        {/* =========================================
            SUMMARY
            ========================================= */}

        <section className="bazar-summary-grid">

          <div className="bazar-summary-card">
            <div className="bazar-summary-icon">
              <MoneyIcon />
            </div>

            <div>
              <span>Total Expense</span>
              <strong>
                ₹{totalAmount.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="bazar-summary-card">
            <div className="bazar-summary-icon">
              <CartIcon />
            </div>

            <div>
              <span>Total Entries</span>
              <strong>{bazars.length}</strong>
            </div>
          </div>

          <div className="bazar-summary-card">
            <div className="bazar-summary-icon">
              <CalendarIcon />
            </div>

            <div>
              <span>Average Per Entry</span>
              <strong>
                ₹{averageAmount.toFixed(2)}
              </strong>
            </div>
          </div>

        </section>


        {/* =========================================
            ADMIN CREATE FORM
            ========================================= */}

        {isAdmin && (
          <section className="bazar-create-card">

            <div className="bazar-section-header">
              <div>
                <span className="bazar-card-label">
                  ADMIN
                </span>

                <h2>Add Bazar Entry</h2>

                <p>
                  Record today's shopping and expense
                  details.
                </p>
              </div>

              <div className="bazar-section-icon">
                <CartIcon />
              </div>
            </div>


            <form
              className="bazar-form"
              onSubmit={handleCreateBazar}
            >

              <div className="bazar-form-grid">

                <div className="bazar-field">
                  <label htmlFor="bazar-date">
                    Date
                  </label>

                  <div className="bazar-input-wrap">
                    <CalendarIcon />

                    <input
                      id="bazar-date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>


                <div className="bazar-field">
                  <label htmlFor="bazar-amount">
                    Amount
                  </label>

                  <div className="bazar-input-wrap">
                    <MoneyIcon />

                    <input
                      id="bazar-amount"
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

              </div>


              <div className="bazar-field">
                <label htmlFor="bazar-items">
                  Items
                </label>

                <div className="bazar-input-wrap bazar-textarea-wrap">
                  <CartIcon />

                  <textarea
                    id="bazar-items"
                    name="items"
                    value={formData.items}
                    onChange={handleChange}
                    placeholder="Example: Rice, Dal, Vegetables, Oil"
                    rows="3"
                    required
                  />
                </div>
              </div>


              <div className="bazar-field">
                <label htmlFor="bazar-note">
                  Note
                </label>

                <div className="bazar-input-wrap bazar-textarea-wrap">
                  <NoteIcon />

                  <textarea
                    id="bazar-note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Optional note"
                    rows="2"
                  />
                </div>
              </div>


              <div className="bazar-form-footer">
                <span>
                  Make sure the amount and items
                  are correct before saving.
                </span>

                <button
                  type="submit"
                  className="bazar-submit-btn"
                  disabled={creating}
                >
                  <CheckIcon />

                  {creating
                    ? "Saving..."
                    : "Add Bazar Entry"}
                </button>
              </div>

            </form>
          </section>
        )}


        {/* =========================================
            HISTORY
            ========================================= */}

        <section className="bazar-history-card">

          <div className="bazar-section-header">
            <div>
              <span className="bazar-card-label">
                YOUR MESS
              </span>

              <h2>
                Bazar History

                <span className="bazar-count">
                  {bazars.length}
                </span>
              </h2>

              <p>
                View all recorded shopping and
                bazar expenses.
              </p>
            </div>

            <div className="bazar-section-icon">
              <CalendarIcon />
            </div>
          </div>


          {bazars.length === 0 ? (
            <div className="bazar-empty">
              <div className="bazar-empty-icon">
                <CartIcon />
              </div>

              <h3>No bazar entries yet</h3>

              <p>
                {isAdmin
                  ? "Add your first bazar entry to start tracking mess shopping."
                  : "No bazar entries have been recorded yet."}
              </p>
            </div>
          ) : (
            <div className="bazar-table-wrapper">
              <table className="bazar-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Purchased By</th>
                    <th>Note</th>
                  </tr>
                </thead>

                <tbody>
                  {bazars.map((bazar) => (
                    <tr key={bazar._id}>

                      <td>
                        <div className="bazar-date-cell">
                          <CalendarIcon />

                          <strong>
                            {formatDate(bazar.date)}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <div className="bazar-items-cell">
                          {bazar.items}
                        </div>
                      </td>

                      <td>
                        <span className="bazar-amount">
                          ₹
                          {Number(
                            bazar.amount
                          ).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <div className="bazar-member-cell">

                          <div className="bazar-member-avatar">
                            {(
                              bazar.purchasedBy?.name ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {bazar.purchasedBy?.name ||
                                "Unknown"}
                            </strong>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="bazar-note">
                          {bazar.note || "-"}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default Bazar;
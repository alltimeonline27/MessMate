import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/Loader";

import "./MealHistory.css";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M7 3v4M17 3v4M3.5 9h17" />
    </svg>
  );
}

function MealIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 3v8M8 3v8M11 3v8M8 11v10" />
      <path d="M17 3v18M17 3c2 1.4 3 3.5 3 6v2h-6V9c0-2.5 1-4.6 3-6Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3.1 2.4-4.7 5.5-4.7s4.9 1.6 5.5 4.7" />
      <path d="M15.5 5.5c2.2.2 3.5 1.5 3.5 3.5 0 1.5-.7 2.5-2 3" />
      <path d="M16 14.5c2.5.5 3.9 2 4.5 4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function UtensilsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 3v7M9 3v7M12 3v7M9 10v11" />
      <path d="M18 3v18M18 3c2 1.4 3 3.5 3 6v2h-6V9c0-2.5 1-4.6 3-6Z" />
    </svg>
  );
}

function MealHistory() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isAdmin = user.role === "admin";

  const [date, setDate] = useState(() => {
    const today = new Date();

    return today.toISOString().split("T")[0];
  });

  const [mealType, setMealType] = useState("lunch");

  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);

  const [summary, setSummary] = useState({
    totalLunch: 0,
    totalDinner: 0,
    totalMeals: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================
  // ADMIN: LOAD ACTUAL MEALS
  // =========================================

  const loadAdminMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/meals", {
        params: {
          date,
          mealType,
        },
      });

      if (response.data.success) {
        setMembers(response.data.members || []);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error(
        "Failed to load admin meals:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load meal data"
      );
    } finally {
      setLoading(false);
    }
  }, [date, mealType]);

  // =========================================
  // MEMBER: LOAD OWN HISTORY
  // =========================================

  const loadMyHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const today = new Date();

      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      const formatDate = (value) => {
        const year = value.getFullYear();

        const month = String(
          value.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          value.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
      };

      const response = await api.get(
        "/meals/my-history",
        {
          params: {
            startDate: formatDate(start),
            endDate: formatDate(end),
          },
        }
      );

      if (response.data.success) {
        setHistory(
          response.data.history || []
        );

        setSummary(
          response.data.summary || {
            totalLunch: 0,
            totalDinner: 0,
            totalMeals: 0,
          }
        );
      } else {
        setHistory([]);

        setSummary({
          totalLunch: 0,
          totalDinner: 0,
          totalMeals: 0,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load meal history:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load your meal history"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================
  // LOAD DATA BY ROLE
  // =========================================

  useEffect(() => {
    if (isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAdminMeals();
    } else {
      
      loadMyHistory();
    }
  }, [
    isAdmin,
    loadAdminMeals,
    loadMyHistory,
  ]);

  // =========================================
  // MESSAGE AUTO CLEAR
  // =========================================

  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, error]);

  // =========================================
  // ADMIN: CHANGE ACTUAL MEAL
  // =========================================

  const handleActualChange = (
    memberId,
    value
  ) => {
    setMembers((previousMembers) =>
      previousMembers.map((item) => {
        if (
          item.member._id !== memberId
        ) {
          return item;
        }

        return {
          ...item,
          actual:
            value === "yes"
              ? true
              : value === "no"
              ? false
              : null,
        };
      })
    );
  };

  // =========================================
  // ADMIN: SAVE ACTUAL MEALS
  // =========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const meals = members.map((item) => ({
        memberId: item.member._id,

        ate: item.actual === true,

        quantity:
          item.actual === true
            ? item.quantity || 1
            : 1,
      }));

      const response = await api.post(
        "/meals",
        {
          date,
          mealType,
          meals,
        }
      );

      if (response.data.success) {
        setMessage(
          `Actual meals saved successfully. Total meals: ${response.data.totalActualMeals}`
        );

        await loadAdminMeals();
      }
    } catch (error) {
      console.error(
        "Failed to save meals:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to save actual meals"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // POLL DISPLAY
  // =========================================

  const getPollText = (vote) => {
    if (vote === "yes") return "YES";

    if (vote === "no") return "NO";

    return "No Vote";
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return <Loader />;
  }

  // =========================================
  // MEMBER VIEW
  // =========================================

  if (!isAdmin) {
    return (
      <div className="meal-history-page">
        <div className="meal-history-container">

          {/* HEADER */}
          <section className="meal-history-heading">
            <div>
              <span className="meal-history-eyebrow">
                MEAL MANAGEMENT
              </span>

              <h1>Meal History</h1>

              <p>
                View your actual meal history for
                the current month.
              </p>
            </div>

            <div className="meal-history-month-badge">
              <CalendarIcon />

              <div>
                <span>Period</span>

                <strong>
                  {new Date().toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>
            </div>
          </section>

          {/* TOAST */}
          <div className="meal-history-toast-container">

            {message && (
              <div className="meal-history-toast meal-history-toast-success">

                <div className="meal-history-toast-icon">
                  <CheckIcon />
                </div>

                <div>
                  <strong>Success</strong>
                  <span>{message}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setMessage("")}
                >
                  ×
                </button>

              </div>
            )}

            {error && (
              <div className="meal-history-toast meal-history-toast-error">

                <div className="meal-history-toast-icon">
                  !
                </div>

                <div>
                  <strong>
                    Something went wrong
                  </strong>

                  <span>{error}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                >
                  ×
                </button>

              </div>
            )}

          </div>

          {/* SUMMARY */}
          <section className="meal-history-summary-grid">

            <article className="meal-history-summary-card summary-total">
              <div className="meal-history-summary-icon">
                <UtensilsIcon />
              </div>

              <div>
                <span>Total Meals</span>

                <strong>
                  {summary.totalMeals}
                </strong>
              </div>
            </article>

            <article className="meal-history-summary-card summary-lunch">
              <div className="meal-history-summary-icon">
                <MealIcon />
              </div>

              <div>
                <span>Total Lunch</span>

                <strong>
                  {summary.totalLunch}
                </strong>
              </div>
            </article>

            <article className="meal-history-summary-card summary-dinner">
              <div className="meal-history-summary-icon">
                <MealIcon />
              </div>

              <div>
                <span>Total Dinner</span>

                <strong>
                  {summary.totalDinner}
                </strong>
              </div>
            </article>

          </section>

          {/* HISTORY */}
          <section className="meal-history-table-card">

            <div className="meal-history-section-header">
              <div>
                <span className="meal-history-card-label">
                  YOUR RECORD
                </span>

                <h2>Monthly Meal History</h2>

                <p>
                  Your daily lunch and dinner
                  records are shown below.
                </p>
              </div>

              <div className="meal-history-section-icon">
                <CalendarIcon />
              </div>
            </div>

            {history.length === 0 ? (
              <div className="meal-history-empty">

                <div className="meal-history-empty-icon">
                  <MealIcon />
                </div>

                <h3>
                  No meal records found
                </h3>

                <p>
                  There are no meal records
                  available for this month.
                </p>

              </div>
            ) : (
              <div className="meal-history-table-wrapper">

                <table className="meal-history-table">

                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Lunch</th>
                      <th>Dinner</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((day) => (
                      <tr key={day.date}>

                        <td>
                          <div className="meal-history-date-cell">
                            <CalendarIcon />

                            <strong>
                              {day.date}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="meal-history-number meal-history-number-lunch">
                            {day.lunch}
                          </span>
                        </td>

                        <td>
                          <span className="meal-history-number meal-history-number-dinner">
                            {day.dinner}
                          </span>
                        </td>

                        <td>
                          <strong className="meal-history-total">
                            {day.total}
                          </strong>
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

  // =========================================
  // ADMIN VIEW
  // =========================================

  return (
    <div className="meal-history-page">
      <div className="meal-history-container">

        {/* HEADER */}
        <section className="meal-history-heading">

          <div>
            <span className="meal-history-eyebrow">
              MEAL MANAGEMENT
            </span>

            <h1>Actual Meal Entry</h1>

            <p>
              Review poll responses and confirm
              the actual meals taken by members.
            </p>
          </div>

          <div className="meal-history-admin-badge">
            <UsersIcon />

            <div>
              <span>Management Mode</span>

              <strong>
                Admin
              </strong>
            </div>
          </div>

        </section>

        {/* TOAST */}
        <div className="meal-history-toast-container">

          {message && (
            <div className="meal-history-toast meal-history-toast-success">

              <div className="meal-history-toast-icon">
                <CheckIcon />
              </div>

              <div>
                <strong>Success</strong>
                <span>{message}</span>
              </div>

              <button
                type="button"
                onClick={() => setMessage("")}
              >
                ×
              </button>

            </div>
          )}

          {error && (
            <div className="meal-history-toast meal-history-toast-error">

              <div className="meal-history-toast-icon">
                !
              </div>

              <div>
                <strong>
                  Something went wrong
                </strong>

                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
              >
                ×
              </button>

            </div>
          )}

        </div>

        {/* FILTER CARD */}
        <section className="meal-history-filter-card">

          <div className="meal-history-section-header">

            <div>
              <span className="meal-history-card-label">
                ADMIN
              </span>

              <h2>Select Meal</h2>

              <p>
                Choose the date and meal type
                you want to manage.
              </p>
            </div>

            <div className="meal-history-section-icon">
              <MealIcon />
            </div>

          </div>

          <div className="meal-history-filter-grid">

            <div className="meal-history-field">

              <label htmlFor="meal-history-date">
                Date
              </label>

              <div className="meal-history-input-wrap">
                <CalendarIcon />

                <input
                  id="meal-history-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                />
              </div>

            </div>

            <div className="meal-history-field">

              <label htmlFor="meal-history-type">
                Meal Type
              </label>

              <div className="meal-history-input-wrap">
                <MealIcon />

                <select
                  id="meal-history-type"
                  value={mealType}
                  onChange={(event) =>
                    setMealType(event.target.value)
                  }
                >
                  <option value="lunch">
                    Lunch
                  </option>

                  <option value="dinner">
                    Dinner
                  </option>
                </select>
              </div>

            </div>

          </div>

        </section>

        {/* MEMBERS TABLE */}
        <section className="meal-history-admin-card">

          <div className="meal-history-section-header">

            <div>
              <span className="meal-history-card-label">
                YOUR MESS
              </span>

              <h2>
                Member Meal Entry
                <span className="meal-history-count">
                  {members.length}
                </span>
              </h2>

              <p>
                Poll votes are used as the initial
                selection. You can change the actual
                meal before submitting.
              </p>
            </div>

            <div className="meal-history-admin-summary">
              <UsersIcon />

              <div>
                <span>Members</span>

                <strong>
                  {members.length}
                </strong>
              </div>
            </div>

          </div>

          {members.length === 0 ? (
            <div className="meal-history-empty">

              <div className="meal-history-empty-icon">
                <UsersIcon />
              </div>

              <h3>
                No active members found
              </h3>

              <p>
                There are no active members
                available for this meal.
              </p>

            </div>
          ) : (
            <div className="meal-history-admin-table-wrapper">

              <table className="meal-history-admin-table">

                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Room</th>
                    <th>Poll Vote</th>
                    <th>Actual Meal</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((item) => (
                    <tr key={item.member._id}>

                      <td>
                        <div className="meal-history-member-cell">

                          <div className="meal-history-member-avatar">
                            {item.member.name
                              ?.charAt(0)
                              ?.toUpperCase() || "M"}
                          </div>

                          <div>
                            <strong>
                              {item.member.name}
                            </strong>

                            <span>
                              {item.member.email}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="meal-history-room">
                          {item.member.roomNumber ||
                            "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`meal-history-poll-badge ${
                            item.pollVote === "yes"
                              ? "poll-yes"
                              : item.pollVote === "no"
                              ? "poll-no"
                              : "poll-none"
                          }`}
                        >
                          {getPollText(
                            item.pollVote
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="meal-history-choice-group">

                          <label
                            className={`meal-history-choice choice-yes ${
                              item.actual === true
                                ? "selected"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`meal-${item.member._id}`}
                              checked={
                                item.actual === true
                              }
                              onChange={() =>
                                handleActualChange(
                                  item.member._id,
                                  "yes"
                                )
                              }
                            />

                            <span className="meal-history-choice-icon">
                              <CheckIcon />
                            </span>

                            <span>YES</span>
                          </label>

                          <label
                            className={`meal-history-choice choice-no ${
                              item.actual === false
                                ? "selected"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`meal-${item.member._id}`}
                              checked={
                                item.actual === false
                              }
                              onChange={() =>
                                handleActualChange(
                                  item.member._id,
                                  "no"
                                )
                              }
                            />

                            <span className="meal-history-choice-icon">
                              <CloseIcon />
                            </span>

                            <span>NO</span>
                          </label>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

          {members.length > 0 && (
            <div className="meal-history-submit-area">

              <div>
                <span>
                  Ready to submit?
                </span>

                <p>
                  Save the actual meal records
                  for the selected date.
                </p>
              </div>

              <button
                type="button"
                className="meal-history-submit-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <CheckIcon />

                <span>
                  {saving
                    ? "Saving..."
                    : "Submit Actual Meals"}
                </span>
              </button>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default MealHistory;
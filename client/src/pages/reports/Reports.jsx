import { useState } from "react";
import "./Reports.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Reports() {
  const getDefaultStartDate = () => {
    const date = new Date();

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];
  };

  const getDefaultEndDate = () => {
    const date = new Date();

    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    )
      .toISOString()
      .split("T")[0];
  };

  const [startDate, setStartDate] = useState(
    getDefaultStartDate()
  );

  const [endDate, setEndDate] = useState(
    getDefaultEndDate()
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/reports/monthly?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load report"
        );
      }

      setReport(data);
    } catch (err) {
      console.error("Report error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    loadReport();
  };

  const money = (value) =>
    `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div className="reports-page">
      <div className="reports-container">

        {/* PAGE HEADER */}
        <section className="reports-header">
          <div>
            <span className="reports-eyebrow">
              MESS FINANCE
            </span>

            <h1>Monthly Reports</h1>

            <p>
              Track your mess finances, meals and
              member-wise billing in one place.
            </p>
          </div>

          <div className="reports-header-icon">
            ₹
          </div>
        </section>

        {/* DATE FILTER */}
        <section className="reports-filter-card">
          <div className="reports-filter-heading">
            <div>
              <span className="reports-section-label">
                REPORT PERIOD
              </span>

              <h2>Generate Monthly Report</h2>

              <p>
                Select a date range to calculate your
                mess report.
              </p>
            </div>

            <div className="reports-filter-icon">
              ▣
            </div>
          </div>

          <form
            className="reports-filter-form"
            onSubmit={handleGenerateReport}
          >
            <div className="reports-field">
              <label htmlFor="reports-start-date">
                Start Date
              </label>

              <div className="reports-input-wrap">
                <span>▣</span>

                <input
                  id="reports-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="reports-field">
              <label htmlFor="reports-end-date">
                End Date
              </label>

              <div className="reports-input-wrap">
                <span>▣</span>

                <input
                  id="reports-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              className="reports-generate-btn"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading ? "Generating..." : "Generate Report"}
              </span>

              <span className="reports-btn-arrow">
                →
              </span>
            </button>
          </form>
        </section>

        {/* ERROR */}
        {error && (
          <div className="reports-error">
            <div className="reports-error-icon">!</div>

            <div>
              <strong>Unable to generate report</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* REPORT CONTENT */}
        {report && (
          <div className="reports-results">

            {/* FINANCIAL SUMMARY */}
            <section className="reports-section">
              <div className="reports-section-heading">
                <div>
                  <span className="reports-section-label">
                    OVERVIEW
                  </span>

                  <h2>Financial Summary</h2>

                  <p>
                    A quick overview of your mess
                    financial activity.
                  </p>
                </div>
              </div>

              <div className="reports-financial-grid">

                <div className="report-stat-card">
                  <div className="report-stat-icon received">
                    ₹
                  </div>

                  <div>
                    <span>Money Received</span>

                    <strong>
                      {money(
                        report.financial
                          .totalMoneyReceived
                      )}
                    </strong>
                  </div>
                </div>

                <div className="report-stat-card">
                  <div className="report-stat-icon bazar">
                    🛒
                  </div>

                  <div>
                    <span>Bazar Expense</span>

                    <strong>
                      {money(
                        report.financial
                          .totalBazarExpense
                      )}
                    </strong>
                  </div>
                </div>

                <div className="report-stat-card">
                  <div className="report-stat-icon other">
                    ₹
                  </div>

                  <div>
                    <span>Other Expense</span>

                    <strong>
                      {money(
                        report.financial
                          .totalOtherExpense
                      )}
                    </strong>
                  </div>
                </div>

                <div className="report-stat-card">
                  <div className="report-stat-icon expense">
                    −
                  </div>

                  <div>
                    <span>Total Expense</span>

                    <strong>
                      {money(
                        report.financial
                          .totalExpense
                      )}
                    </strong>
                  </div>
                </div>

                <div className="report-stat-card report-balance-card">
                  <div className="report-stat-icon balance">
                    ✓
                  </div>

                  <div>
                    <span>Available Balance</span>

                    <strong>
                      {money(
                        report.financial
                          .availableBalance
                      )}
                    </strong>
                  </div>
                </div>

              </div>
            </section>

            {/* MEAL SUMMARY */}
            <section className="reports-section">
              <div className="reports-section-heading">
                <div>
                  <span className="reports-section-label">
                    MEALS
                  </span>

                  <h2>Meal Summary</h2>

                  <p>
                    Meal activity calculated for the
                    selected period.
                  </p>
                </div>
              </div>

              <div className="reports-meal-grid">

                <div className="reports-meal-card">
                  <span>Total Actual Meals</span>

                  <strong>
                    {report.meals.totalActualMeals}
                  </strong>

                  <small>
                    Actual meals consumed
                  </small>
                </div>

                <div className="reports-meal-card featured">
                  <span>Meal Rate</span>

                  <strong>
                    {money(report.meals.mealRate)}
                  </strong>

                  <small>
                    Cost per actual meal
                  </small>
                </div>

                <div className="reports-meal-card">
                  <span>Total Members</span>

                  <strong>
                    {report.memberReports.length}
                  </strong>

                  <small>
                    Active mess members
                  </small>
                </div>

              </div>
            </section>

            {/* EXPENSE CATEGORY */}
            <section className="reports-section">
              <div className="reports-section-heading">
                <div>
                  <span className="reports-section-label">
                    EXPENSES
                  </span>

                  <h2>Expense by Category</h2>

                  <p>
                    Breakdown of non-bazar expenses.
                  </p>
                </div>
              </div>

              {Object.keys(report.categoryTotals).length ===
                0 ? (
                <div className="reports-empty-card">
                  <div className="reports-empty-icon">
                    ₹
                  </div>

                  <h3>No other expenses found</h3>

                  <p>
                    There are no non-bazar expenses
                    recorded for this period.
                  </p>
                </div>
              ) : (
                <div className="reports-table-card">
                  <div className="reports-table-scroll">
                    <table className="reports-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {Object.entries(
                          report.categoryTotals
                        ).map(
                          ([category, amount]) => (
                            <tr key={category}>
                              <td>
                                <span className="category-name">
                                  {category}
                                </span>
                              </td>

                              <td>
                                <strong className="amount-value">
                                  {money(amount)}
                                </strong>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* MEMBER REPORT */}
            <section className="reports-section">
              <div className="reports-section-heading member-heading">
                <div>
                  <span className="reports-section-label">
                    MEMBERS
                  </span>

                  <h2>Member-wise Report</h2>

                  <p>
                    Individual meal bills, payments and
                    outstanding dues.
                  </p>
                </div>

                <div className="member-count-badge">
                  {report.memberReports.length} Members
                </div>
              </div>

              {report.memberReports.length === 0 ? (
                <div className="reports-empty-card">
                  <div className="reports-empty-icon">
                    ♙
                  </div>

                  <h3>No active members found</h3>

                  <p>
                    There are no active members available
                    for this report.
                  </p>
                </div>
              ) : (
                <div className="reports-table-card member-table-card">
                  <div className="reports-table-scroll">
                    <table className="reports-table member-report-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Room</th>
                          <th>Total Meals</th>
                          <th>Bill</th>
                          <th>Paid</th>
                          <th>Due</th>
                        </tr>
                      </thead>

                      <tbody>
                        {report.memberReports.map(
                          (item) => (
                            <tr key={item.member.id}>
                              <td>
                                <div className="member-name-cell">
                                  <div className="member-avatar">
                                    {item.member.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "M"}
                                  </div>

                                  <strong>
                                    {item.member.name}
                                  </strong>
                                </div>
                              </td>

                              <td>
                                <span className="room-badge">
                                  {item.member.roomNumber || "-"}
                                </span>
                              </td>

                              <td>
                                <span className="meal-count">
                                  {item.totalMeals}
                                </span>
                              </td>

                              <td>
                                <strong>
                                  {money(item.memberBill)}
                                </strong>
                              </td>

                              <td>
                                <span className="paid-value">
                                  {money(item.totalPaid)}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={
                                    item.due > 0
                                      ? "due-value"
                                      : "due-value paid"
                                  }
                                >
                                  {money(item.due)}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

          </div>
        )}

      </div>
    </div>
  );
}

export default Reports;
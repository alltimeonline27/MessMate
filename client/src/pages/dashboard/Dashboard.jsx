import { useEffect, useState } from "react";
import "./Dashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (!cancelled) {
            setError("Please login first.");
            setLoading(false);
          }
          return;
        }

        const response = await fetch(
          `${API_URL}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard"
          );
        }

        if (!cancelled) {
          setDashboard(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchDashboard();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <span>⚠</span>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <span>📊</span>
          <h2>No dashboard data</h2>
          <p>No dashboard information is available right now.</p>
        </div>
      </div>
    );
  }

  const formatMoney = (value) =>
    `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div className="dashboard-page">
      {/* =========================
          HEADER
      ========================== */}
      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            MESS OVERVIEW
          </span>

          <h1>MessMate Dashboard</h1>

          <p>
            Everything important about your mess,
            in one place.
          </p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>
          <strong>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      </section>

      {/* =========================
          STAT CARDS
      ========================== */}
      <section className="dashboard-stats">
        <div className="dashboard-card card-members">
          <div className="card-top">
            <div className="card-icon">♙</div>
            <span className="card-label">Members</span>
          </div>

          <div className="card-value">
            {dashboard.members.totalMembers}
          </div>

          <p className="card-description">
            Active mess members
          </p>
        </div>

        <div className="dashboard-card card-meals">
          <div className="card-top">
            <div className="card-icon">🍽</div>
            <span className="card-label">Total Meals</span>
          </div>

          <div className="card-value">
            {dashboard.meals.totalMeals}
          </div>

          <p className="card-description">
            Meals recorded this month
          </p>
        </div>

        <div className="dashboard-card card-today">
          <div className="card-top">
            <div className="card-icon">◷</div>
            <span className="card-label">Today's Meals</span>
          </div>

          <div className="card-value">
            {dashboard.meals.todaysMeals}
          </div>

          <p className="card-description">
            Meals recorded today
          </p>
        </div>

        <div className="dashboard-card card-rate featured-card">
          <div className="card-top">
            <div className="card-icon">₹</div>
            <span className="card-label">Meal Rate</span>
          </div>

          <div className="card-value">
            {formatMoney(dashboard.meals.mealRate)}
          </div>

          <p className="card-description">
            Current meal rate
          </p>
        </div>
      </section>

      {/* =========================
          FINANCIAL OVERVIEW
      ========================== */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="dashboard-eyebrow">
              FINANCIAL OVERVIEW
            </span>

            <h2>Mess finances</h2>
          </div>

          <span className="section-badge">
            Current Month
          </span>
        </div>

        <div className="finance-grid">
          <div className="finance-card expense-card">
            <div className="finance-icon">↘</div>

            <div>
              <span>Total Expenses</span>

              <strong>
                {formatMoney(
                  dashboard.financial.totalExpense
                )}
              </strong>

              <small>
                Total mess spending
              </small>
            </div>
          </div>

          <div className="finance-card received-card">
            <div className="finance-icon">↗</div>

            <div>
              <span>Money Received</span>

              <strong>
                {formatMoney(
                  dashboard.financial.totalMoneyReceived
                )}
              </strong>

              <small>
                Total payments received
              </small>
            </div>
          </div>

          <div className="finance-card due-card">
            <div className="finance-icon">!</div>

            <div>
              <span>Total Due</span>

              <strong>
                {formatMoney(
                  dashboard.financial.totalDue
                )}
              </strong>

              <small>
                Outstanding member dues
              </small>
            </div>
          </div>

          <div className="finance-card balance-card highlight-finance">
            <div className="finance-icon">✓</div>

            <div>
              <span>Available Balance</span>

              <strong>
                {formatMoney(
                  dashboard.financial.availableBalance
                )}
              </strong>

              <small>
                Current available balance
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          QUICK OVERVIEW
      ========================== */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="dashboard-eyebrow">
              QUICK OVERVIEW
            </span>

            <h2>Today's activity</h2>
          </div>
        </div>

        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-icon">🛒</div>

            <div>
              <span>Today's Bazar</span>

              <strong>
                {formatMoney(
                  dashboard.bazar.todaysBazarExpense
                )}
              </strong>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-icon warning-icon">
              !
            </div>

            <div>
              <span>Payment Verification</span>

              <strong>
                {dashboard.payments
                  .pendingPaymentVerification}
              </strong>

              <small>
                Pending verification
              </small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
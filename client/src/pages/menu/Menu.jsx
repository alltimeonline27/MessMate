import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Menu.css";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const emptyDay = {
  breakfast: "",
  lunch: "",
  dinner: "",
};

const emptyRoutine = {
  monday: { ...emptyDay },
  tuesday: { ...emptyDay },
  wednesday: { ...emptyDay },
  thursday: { ...emptyDay },
  friday: { ...emptyDay },
  saturday: { ...emptyDay },
  sunday: { ...emptyDay },
};

function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDayName(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return dayNames[date.getDay()];
}

function formatDayName(day) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function Menu() {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";

  const [weeklyRoutine, setWeeklyRoutine] =
    useState(emptyRoutine);

  const [dailyOverrides, setDailyOverrides] =
    useState([]);

  const [todayMenu, setTodayMenu] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [dailyMenu, setDailyMenu] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });

  const [hasSelectedDateOverride, setHasSelectedDateOverride] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [savingDaily, setSavingDaily] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateSelectedDateData = (
    date,
    routine,
    overrides
  ) => {
    const override = overrides.find((item) => {
      const itemDate = new Date(item.date)
        .toISOString()
        .split("T")[0];

      return itemDate === date;
    });

    const dayName = getDayName(date);

    const routineMenu =
      routine?.[dayName] || emptyDay;

    if (override) {
      setDailyMenu({
        breakfast: override.breakfast || "",
        lunch: override.lunch || "",
        dinner: override.dinner || "",
      });

      setHasSelectedDateOverride(true);
    } else {
      setDailyMenu({
        breakfast: routineMenu.breakfast || "",
        lunch: routineMenu.lunch || "",
        dinner: routineMenu.dinner || "",
      });

      setHasSelectedDateOverride(false);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/menu",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load menu"
        );
      }

      const menu = data.menu;

      const routine = {
        ...emptyRoutine,
        ...menu.weeklyRoutine,
      };

      const overrides = menu.dailyOverrides || [];

      setWeeklyRoutine(routine);
      setDailyOverrides(overrides);
      setTodayMenu(menu.today.menu);

      updateSelectedDateData(
        selectedDate,
        routine,
        overrides
      );
    } catch (err) {
      console.error("Menu error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 0);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWeeklyChange = (
    day,
    meal,
    value
  ) => {
    setWeeklyRoutine((previous) => ({
      ...previous,
      [day]: {
        ...previous[day],
        [meal]: value,
      },
    }));
  };

  const handleDailyChange = (meal, value) => {
    setDailyMenu((previous) => ({
      ...previous,
      [meal]: value,
    }));
  };

  const handleDateChange = (event) => {
    const date = event.target.value;

    setSelectedDate(date);

    updateSelectedDateData(
      date,
      weeklyRoutine,
      dailyOverrides
    );

    setMessage("");
    setError("");
  };

  const saveWeeklyRoutine = async () => {
    try {
      setSavingWeekly(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/menu/weekly",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            weeklyRoutine,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update weekly routine"
        );
      }

      setMessage(
        "Weekly routine updated successfully."
      );

      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingWeekly(false);
    }
  };

  const saveDailyMenu = async () => {
    try {
      setSavingDaily(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/menu/daily",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: selectedDate,
            breakfast: dailyMenu.breakfast,
            lunch: dailyMenu.lunch,
            dinner: dailyMenu.dinner,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update daily menu"
        );
      }

      setMessage(
        "Daily menu updated successfully."
      );

      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingDaily(false);
    }
  };

  const removeDailyOverride = async () => {
    try {
      setSavingDaily(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/menu/daily/${selectedDate}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove daily override"
        );
      }

      setMessage(
        "Daily override removed. Weekly routine is active again."
      );

      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingDaily(false);
    }
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-loading">
          <div className="menu-loading-spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">

      {/* PAGE HEADER */}
      <div className="menu-page-header">
        <div>
          <span className="menu-eyebrow">
            MEAL PLANNING
          </span>

          <h1>Mess Menu</h1>

          <p>
            View and manage your daily and weekly meal routine.
          </p>
        </div>

        <div className="menu-role-badge">
          {isAdmin ? "Admin Mode" : "Member View"}
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="menu-alert menu-alert-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <div className="menu-alert menu-alert-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* TODAY'S MENU */}
      <section className="menu-today-card">
        <div className="menu-section-heading">
          <div>
            <span className="menu-section-label">
              TODAY
            </span>

            <h2>Today's Menu</h2>
          </div>

          <div className="menu-date-badge">
            {formatDayName(
              getDayName(getTodayDate())
            )}
            <span>{getTodayDate()}</span>
          </div>
        </div>

        <div className="today-meals">
          <div className="today-meal breakfast">
            <div className="meal-icon">☀️</div>

            <div>
              <span>Breakfast</span>
              <strong>
                {todayMenu.breakfast || "Not set"}
              </strong>
            </div>
          </div>

          <div className="today-meal lunch">
            <div className="meal-icon">🍛</div>

            <div>
              <span>Lunch</span>
              <strong>
                {todayMenu.lunch || "Not set"}
              </strong>
            </div>
          </div>

          <div className="today-meal dinner">
            <div className="meal-icon">🌙</div>

            <div>
              <span>Dinner</span>
              <strong>
                {todayMenu.dinner || "Not set"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY MENU */}
      <section className="menu-card daily-menu-card">
        <div className="menu-section-heading">
          <div>
            <span className="menu-section-label">
              DAILY MENU
            </span>

            <h2>Menu for Selected Date</h2>
          </div>
        </div>

        <div className="menu-date-selector">
          <label htmlFor="menu-date">
            Select Date
          </label>

          <input
            id="menu-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
          />

          <div className="selected-day">
            {formatDayName(
              getDayName(selectedDate)
            )}

            {hasSelectedDateOverride && (
              <span>Daily Override</span>
            )}
          </div>
        </div>

        {isAdmin ? (
          <div className="menu-editor-grid">

            <div className="menu-editor-item">
              <label>Breakfast</label>

              <input
                type="text"
                value={dailyMenu.breakfast}
                onChange={(event) =>
                  handleDailyChange(
                    "breakfast",
                    event.target.value
                  )
                }
                placeholder="Enter breakfast"
              />
            </div>

            <div className="menu-editor-item">
              <label>Lunch</label>

              <input
                type="text"
                value={dailyMenu.lunch}
                onChange={(event) =>
                  handleDailyChange(
                    "lunch",
                    event.target.value
                  )
                }
                placeholder="Enter lunch"
              />
            </div>

            <div className="menu-editor-item">
              <label>Dinner</label>

              <input
                type="text"
                value={dailyMenu.dinner}
                onChange={(event) =>
                  handleDailyChange(
                    "dinner",
                    event.target.value
                  )
                }
                placeholder="Enter dinner"
              />
            </div>

          </div>
        ) : (
          <div className="menu-view-grid">

            <div className="menu-view-item">
              <span>Breakfast</span>
              <strong>
                {dailyMenu.breakfast || "Not set"}
              </strong>
            </div>

            <div className="menu-view-item">
              <span>Lunch</span>
              <strong>
                {dailyMenu.lunch || "Not set"}
              </strong>
            </div>

            <div className="menu-view-item">
              <span>Dinner</span>
              <strong>
                {dailyMenu.dinner || "Not set"}
              </strong>
            </div>

          </div>
        )}

        {isAdmin && (
          <div className="menu-actions">

            <button
              className="menu-primary-btn"
              onClick={saveDailyMenu}
              disabled={savingDaily}
            >
              {savingDaily
                ? "Saving..."
                : "Save Daily Menu"}
            </button>

            {hasSelectedDateOverride && (
              <button
                className="menu-secondary-btn"
                onClick={removeDailyOverride}
                disabled={savingDaily}
              >
                Remove Override
              </button>
            )}

          </div>
        )}

        {!isAdmin && (
          <p className="member-note">
            Members can only view the menu.
          </p>
        )}
      </section>

      {/* WEEKLY ROUTINE */}
      <section className="menu-card weekly-card">

        <div className="menu-section-heading">
          <div>
            <span className="menu-section-label">
              WEEKLY ROUTINE
            </span>

            <h2>Regular Meal Schedule</h2>
          </div>
        </div>

        <div className="weekly-grid">

          {days.map((day) => (
            <div
              className="weekly-day-card"
              key={day}
            >
              <div className="weekly-day-header">
                <h3>{formatDayName(day)}</h3>
              </div>

              {isAdmin ? (
                <div className="weekly-editor">

                  <div>
                    <label>Breakfast</label>

                    <input
                      type="text"
                      value={
                        weeklyRoutine[day]?.breakfast || ""
                      }
                      onChange={(event) =>
                        handleWeeklyChange(
                          day,
                          "breakfast",
                          event.target.value
                        )
                      }
                      placeholder="Breakfast"
                    />
                  </div>

                  <div>
                    <label>Lunch</label>

                    <input
                      type="text"
                      value={
                        weeklyRoutine[day]?.lunch || ""
                      }
                      onChange={(event) =>
                        handleWeeklyChange(
                          day,
                          "lunch",
                          event.target.value
                        )
                      }
                      placeholder="Lunch"
                    />
                  </div>

                  <div>
                    <label>Dinner</label>

                    <input
                      type="text"
                      value={
                        weeklyRoutine[day]?.dinner || ""
                      }
                      onChange={(event) =>
                        handleWeeklyChange(
                          day,
                          "dinner",
                          event.target.value
                        )
                      }
                      placeholder="Dinner"
                    />
                  </div>

                </div>
              ) : (
                <div className="weekly-view">

                  <div>
                    <span>Breakfast</span>
                    <strong>
                      {weeklyRoutine[day]?.breakfast ||
                        "Not set"}
                    </strong>
                  </div>

                  <div>
                    <span>Lunch</span>
                    <strong>
                      {weeklyRoutine[day]?.lunch ||
                        "Not set"}
                    </strong>
                  </div>

                  <div>
                    <span>Dinner</span>
                    <strong>
                      {weeklyRoutine[day]?.dinner ||
                        "Not set"}
                    </strong>
                  </div>

                </div>
              )}
            </div>
          ))}

        </div>

        {isAdmin && (
          <div className="weekly-save-row">
            <button
              className="menu-primary-btn"
              onClick={saveWeeklyRoutine}
              disabled={savingWeekly}
            >
              {savingWeekly
                ? "Saving..."
                : "Save Weekly Routine"}
            </button>
          </div>
        )}

      </section>

    </div>
  );
}

export default Menu;
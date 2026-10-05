import { useEffect, useState } from "react";
import api from "../../services/api";
import "./BazarSchedule.css";

const BazarSchedule = () => {
  const [members, setMembers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [note, setNote] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    };
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [memberResponse, scheduleResponse] = await Promise.all([
        api.get("/members"),
        api.get("/bazar-schedules"),
      ]);

      setMembers(memberResponse.data.members || []);
      setSchedules(scheduleResponse.data.schedules || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load bazar schedule"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, error]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getScheduleForDate = (date) => {
    return schedules.find((schedule) => {
      const scheduleDate = new Date(schedule.date);

      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      );
    });
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const monthName = new Date(
    currentMonth.year,
    currentMonth.month - 1,
    1
  ).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handleMemberToggle = (memberId) => {
    setSelectedMembers((previous) => {
      if (previous.includes(memberId)) {
        return previous.filter((id) => id !== memberId);
      }

      return [...previous, memberId];
    });
  };

  const openAssignModal = (date) => {
    const formattedDate = formatDateForInput(date);
    const existingSchedule = getScheduleForDate(date);

    setSelectedDate(formattedDate);
    setError("");
    setMessage("");

    if (existingSchedule) {
      setSelectedMembers(
        existingSchedule.assignedMembers.map((member) => member._id)
      );

      setNote(existingSchedule.note || "");
    } else {
      setSelectedMembers([]);
      setNote("");
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setSelectedDate("");
    setSelectedMembers([]);
    setNote("");
  };

  const handleSaveSchedule = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!selectedDate) {
        setError("Please select a date");
        return;
      }

      if (selectedMembers.length === 0) {
        setError("Please select at least one member");
        return;
      }

      await api.post("/bazar-schedules", {
        date: selectedDate,
        assignedMembers: selectedMembers,
        note,
      });

      setMessage("Bazar schedule saved successfully");

      setIsModalOpen(false);
      setSelectedDate("");
      setSelectedMembers([]);
      setNote("");

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save bazar schedule"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNextMonth = async () => {
    try {
      setGenerating(true);
      setError("");
      setMessage("");

      let nextMonth = currentMonth.month + 1;
      let nextYear = currentMonth.year;

      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      const response = await api.post(
        "/bazar-schedules/generate-next-month",
        {
          year: nextYear,
          month: nextMonth,
        }
      );

      setMessage(
        response.data.message ||
          "Next month's schedule generated successfully"
      );

      setCurrentMonth({
        year: nextYear,
        month: nextMonth,
      });

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to generate next month's schedule"
      );
    } finally {
      setGenerating(false);
    }
  };

  const goToPreviousMonth = () => {
    let month = currentMonth.month - 1;
    let year = currentMonth.year;

    if (month < 1) {
      month = 12;
      year -= 1;
    }

    setCurrentMonth({ year, month });
  };

  const goToNextMonth = () => {
    let month = currentMonth.month + 1;
    let year = currentMonth.year;

    if (month > 12) {
      month = 1;
      year += 1;
    }

    setCurrentMonth({ year, month });
  };

  if (loading) {
    return (
      <div className="bazar-schedule-page">
        <div className="bazar-loading-card">
          <div className="bazar-loading-spinner"></div>
          <p>Loading bazar schedule...</p>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(
    currentMonth.year,
    currentMonth.month
  );

  const days = Array.from(
    { length: daysInMonth },
    (_, index) =>
      new Date(
        currentMonth.year,
        currentMonth.month - 1,
        index + 1
      )
  );

  return (
    <div className="bazar-schedule-page">
      <div className="bazar-schedule-container">

        {/* HEADER */}
        <section className="bazar-schedule-header">
          <div className="bazar-schedule-heading">
            <span className="bazar-eyebrow">MESS MANAGEMENT</span>

            <h1>Bazar Schedule</h1>

            <p>
              Manage monthly bazar duties of your mess.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="bazar-generate-button"
              onClick={handleGenerateNextMonth}
              disabled={generating}
            >
              <span className="bazar-button-icon">＋</span>

              {generating
                ? "Generating..."
                : "Generate Next Month"}
            </button>
          )}
        </section>

        {/* TOASTS */}
        <div className="bazar-toast-container">
          {message && (
            <div className="bazar-toast bazar-toast-success">
              <span className="bazar-toast-icon">✓</span>

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

          {error && !isModalOpen && (
            <div className="bazar-toast bazar-toast-error">
              <span className="bazar-toast-icon">!</span>

              <div>
                <strong>Something went wrong</strong>
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

        {/* MONTH NAVIGATION */}
        <section className="bazar-month-navigation">
          <button
            type="button"
            className="bazar-month-button"
            onClick={goToPreviousMonth}
          >
            <span>←</span>
            Previous
          </button>

          <div className="bazar-month-center">
            <span className="bazar-calendar-icon">▣</span>
            <div>
              <span>MONTHLY SCHEDULE</span>
              <h2>{monthName}</h2>
            </div>
          </div>

          <button
            type="button"
            className="bazar-month-button"
            onClick={goToNextMonth}
          >
            Next
            <span>→</span>
          </button>
        </section>

        {/* TABLE CARD */}
        <section className="bazar-schedule-card">
          <div className="bazar-card-header">
            <div>
              <span className="bazar-card-eyebrow">
                YOUR MESS
              </span>

              <h2>Monthly Bazar List</h2>

              <p>
                View and manage daily bazar responsibilities.
              </p>
            </div>

            <div className="bazar-card-count">
              <strong>{daysInMonth}</strong>
              <span>Days</span>
            </div>
          </div>

          <div className="bazar-table-wrapper">
            <table className="bazar-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Bazar Duty</th>
                </tr>
              </thead>

              <tbody>
                {days.map((date) => {
                  const schedule = getScheduleForDate(date);

                  return (
                    <tr
                      key={date.toISOString()}
                      className={
                        schedule
                          ? "bazar-row assigned"
                          : "bazar-row"
                      }
                    >
                      <td>
                        <div className="bazar-date-cell">
                          <span className="bazar-date-number">
                            {date.getDate()}
                          </span>

                          <span>
                            {date.toLocaleDateString("default", {
                              month: "short",
                            })}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="bazar-day">
                          {date.toLocaleDateString("default", {
                            weekday: "long",
                          })}
                        </span>
                      </td>

                      <td>
                        <div className="bazar-duty-cell">
                          {schedule?.assignedMembers?.length > 0 ? (
                            <div className="bazar-member-list">
                              {schedule.assignedMembers.map(
                                (member) => (
                                  <span
                                    key={member._id}
                                    className="bazar-member-badge"
                                  >
                                    <span className="badge-avatar">
                                      {member.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                    </span>

                                    {member.name}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="bazar-not-assigned">
                              <span>○</span>
                              Not assigned
                            </span>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              className={
                                schedule
                                  ? "bazar-edit-button"
                                  : "bazar-assign-button"
                              }
                              onClick={() =>
                                openAssignModal(date)
                              }
                            >
                              {schedule ? (
                                <>
                                  <span>✎</span>
                                  Edit
                                </>
                              ) : (
                                <>
                                  <span>＋</span>
                                  Assign
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* MEMBER INFO */}
        {!isAdmin && (
          <section className="bazar-member-info-card">
            <div className="bazar-info-icon">✓</div>

            <div>
              <span className="bazar-card-eyebrow">
                MEMBER VIEW
              </span>

              <h2>Your Bazar Duties</h2>

              <p>
                Your assigned bazar dates are shown in the
                monthly schedule above.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && isAdmin && (
        <div className="bazar-modal-overlay">
          <div className="bazar-modal">

            <div className="bazar-modal-header">
              <div>
                <span className="bazar-card-eyebrow">
                  BAZAR MANAGEMENT
                </span>

                <h2>
                  {getScheduleForDate(
                    new Date(`${selectedDate}T00:00:00`)
                  )
                    ? "Edit Bazar Duty"
                    : "Assign Bazar Duty"}
                </h2>
              </div>

              <button
                type="button"
                className="bazar-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveSchedule}>

              <div className="bazar-form-group">
                <label>Selected Date</label>

                <div className="bazar-input-wrap">
                  <span>▣</span>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      const date = new Date(
                        `${event.target.value}T00:00:00`
                      );

                      const existingSchedule =
                        getScheduleForDate(date);

                      setSelectedDate(event.target.value);

                      if (existingSchedule) {
                        setSelectedMembers(
                          existingSchedule.assignedMembers.map(
                            (member) => member._id
                          )
                        );

                        setNote(
                          existingSchedule.note || ""
                        );
                      } else {
                        setSelectedMembers([]);
                        setNote("");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bazar-form-group">
                <label>
                  Select Members Who Will Go For Bazar
                </label>

                <div className="bazar-member-selection">
                  {members.length === 0 ? (
                    <p>No active members available.</p>
                  ) : (
                    members.map((member) => (
                      <label
                        key={member._id}
                        className={`bazar-checkbox ${
                          selectedMembers.includes(member._id)
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(
                            member._id
                          )}
                          onChange={() =>
                            handleMemberToggle(member._id)
                          }
                        />

                        <span className="custom-checkbox">
                          ✓
                        </span>

                        <span className="member-select-text">
                          <strong>{member.name}</strong>

                          {member.roomNumber && (
                            <small>
                              Room {member.roomNumber}
                            </small>
                          )}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="bazar-form-group">
                <label>Note</label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="Optional note..."
                  rows="3"
                />
              </div>

              {error && (
                <div className="bazar-modal-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              <div className="bazar-modal-actions">
                <button
                  type="button"
                  className="bazar-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bazar-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Bazar Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BazarSchedule;
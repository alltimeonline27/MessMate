import { useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";

import "./MealPoll.css";

function MealIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 3v8M8 3v8M11 3v8M8 11v10" />
      <path d="M17 3v18M17 3c2 1.4 3 3.5 3 6v2h-6V9c0-2.5 1-4.6 3-6Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M7 3v4M17 3v4M3.5 9h17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MealPoll() {
  const { user } = useAuth();

  const [polls, setPolls] = useState([]);
  const [pollVotes, setPollVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [voting, setVoting] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    mealType: "lunch",
    deadline: "",
  });

  const fetchPolls = async () => {
    try {
      setError("");

      const response = await api.get("/meal-polls");

      const loadedPolls = response.data.polls || [];

      setPolls(loadedPolls);

      const voteResults = {};

      await Promise.all(
        loadedPolls.map(async (poll) => {
          try {
            const voteResponse = await api.get(
              `/meal-votes/${poll._id}`
            );

            voteResults[poll._id] = voteResponse.data;
          } catch {
            voteResults[poll._id] = {
              yesVotes: 0,
              noVotes: 0,
              totalVotes: 0,
              myVote: null,
            };
          }
        })
      );

      setPollVotes(voteResults);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load meal polls"
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchPolls();
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
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreatePoll = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/meal-polls",
        formData
      );

      setMessage(response.data.message);

      setFormData({
        date: "",
        mealType: "lunch",
        deadline: "",
      });

      await fetchPolls();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create meal poll"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId, vote) => {
    try {
      setVoting(pollId);
      setError("");
      setMessage("");

      const response = await api.post(
        `/meal-votes/${pollId}`,
        { vote }
      );

      setMessage(response.data.message);

      const voteResponse = await api.get(
        `/meal-votes/${pollId}`
      );

      setPollVotes((previousVotes) => ({
        ...previousVotes,
        [pollId]: voteResponse.data,
      }));
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit meal vote"
      );
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="meal-poll-page">
      <div className="meal-poll-container">

        {/* PAGE HEADER */}
        <section className="meal-poll-heading">
          <div>
            <span className="meal-poll-eyebrow">
              MEAL MANAGEMENT
            </span>

            <h1>Daily Meal Poll</h1>

            <p>
              Ask your mess members whether they will
              join today's meal.
            </p>
          </div>

          <div className="meal-poll-mess-badge">
            <MealIcon />

            <div>
              <span>Current Mess</span>
              <strong>
                {user?.mess?.name || "Your Mess"}
              </strong>
            </div>
          </div>
        </section>

        {/* TOAST */}
        <div className="meal-poll-toast-container">
          {message && (
            <div className="meal-poll-toast meal-poll-toast-success">
              <div className="meal-poll-toast-icon">
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
            <div className="meal-poll-toast meal-poll-toast-error">
              <div className="meal-poll-toast-icon">
                !
              </div>

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

        {/* ADMIN CREATE POLL */}
        {user?.role === "admin" && (
          <section className="meal-poll-create-card">

            <div className="meal-poll-section-header">
              <div>
                <span className="meal-poll-card-label">
                  ADMIN
                </span>

                <h2>Create Meal Poll</h2>

                <p>
                  Create a voting request for a specific
                  meal and deadline.
                </p>
              </div>

              <div className="meal-poll-section-icon">
                <PlusIcon />
              </div>
            </div>

            <form
              className="meal-poll-form"
              onSubmit={handleCreatePoll}
            >
              <div className="meal-poll-form-grid">

                <div className="meal-poll-field">
                  <label htmlFor="meal-poll-date">
                    Meal Date
                  </label>

                  <div className="meal-poll-input-wrap">
                    <CalendarIcon />

                    <input
                      id="meal-poll-date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="meal-poll-field">
                  <label htmlFor="meal-poll-type">
                    Meal Type
                  </label>

                  <div className="meal-poll-input-wrap">
                    <MealIcon />

                    <select
                      id="meal-poll-type"
                      name="mealType"
                      value={formData.mealType}
                      onChange={handleChange}
                      required
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

                <div className="meal-poll-field">
                  <label htmlFor="meal-poll-deadline">
                    Voting Deadline
                  </label>

                  <div className="meal-poll-input-wrap">
                    <ClockIcon />

                    <input
                      id="meal-poll-deadline"
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

              </div>

              <div className="meal-poll-form-actions">
                <button
                  type="submit"
                  className="meal-poll-create-btn"
                  disabled={creating}
                >
                  <PlusIcon />

                  <span>
                    {creating
                      ? "Creating..."
                      : "Create Meal Poll"}
                  </span>
                </button>
              </div>
            </form>

          </section>
        )}

        {/* POLL LIST */}
        <section className="meal-poll-list-section">

          <div className="meal-poll-list-header">
            <div>
              <span className="meal-poll-card-label">
                YOUR MESS
              </span>

              <h2>
                Active Meal Polls
                <span>{polls.length}</span>
              </h2>
            </div>
          </div>

          {polls.length === 0 ? (
            <div className="meal-poll-empty">
              <div className="meal-poll-empty-icon">
                <MealIcon />
              </div>

              <h3>No meal polls yet</h3>

              <p>
                There are no meal polls available for
                your mess right now.
              </p>
            </div>
          ) : (
            <div className="meal-poll-grid">
              {polls.map((poll) => {
                const votes = pollVotes[poll._id] || {
                  yesVotes: 0,
                  noVotes: 0,
                  totalVotes: 0,
                  myVote: null,
                };

                const isExpired =
                  new Date(poll.deadline) < new Date();

                const votingDisabled =
                  poll.status !== "open" ||
                  isExpired ||
                  voting === poll._id;

                const yesPercentage =
                  votes.totalVotes > 0
                    ? Math.round(
                        (votes.yesVotes /
                          votes.totalVotes) *
                          100
                      )
                    : 0;

                const noPercentage =
                  votes.totalVotes > 0
                    ? Math.round(
                        (votes.noVotes /
                          votes.totalVotes) *
                          100
                      )
                    : 0;

                return (
                  <article
                    key={poll._id}
                    className="meal-poll-card"
                  >
                    <div className="meal-poll-card-top">

                      <div className="meal-poll-card-title">
                        <div className="meal-poll-meal-icon">
                          <MealIcon />
                        </div>

                        <div>
                          <span>
                            {poll.mealType === "lunch"
                              ? "LUNCH"
                              : "DINNER"}
                          </span>

                          <h3>
                            {poll.mealType === "lunch"
                              ? "Lunch"
                              : "Dinner"}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`meal-poll-status ${
                          poll.status === "open" &&
                          !isExpired
                            ? "status-open"
                            : "status-closed"
                        }`}
                      >
                        {poll.status === "open" &&
                        !isExpired
                          ? "Open"
                          : "Closed"}
                      </span>

                    </div>

                    <div className="meal-poll-details">

                      <div className="meal-poll-detail">
                        <CalendarIcon />

                        <div>
                          <span>Date</span>

                          <strong>
                            {new Date(
                              poll.date
                            ).toLocaleDateString()}
                          </strong>
                        </div>
                      </div>

                      <div className="meal-poll-detail">
                        <ClockIcon />

                        <div>
                          <span>Deadline</span>

                          <strong>
                            {new Date(
                              poll.deadline
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {poll.createdBy && (
                        <div className="meal-poll-detail">
                          <UserIcon />

                          <div>
                            <span>Created By</span>

                            <strong>
                              {poll.createdBy.name}
                            </strong>
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="meal-poll-vote-heading">
                      <span>Will you eat?</span>

                      <strong>
                        {votes.totalVotes} votes
                      </strong>
                    </div>

                    <div className="meal-poll-vote-actions">

                      <button
                        type="button"
                        className={`meal-vote-btn meal-vote-yes ${
                          votes.myVote === "yes"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleVote(
                            poll._id,
                            "yes"
                          )
                        }
                        disabled={votingDisabled}
                      >
                        <CheckIcon />

                        <span>
                          {votes.myVote === "yes"
                            ? "YES"
                            : "YES"}
                        </span>
                      </button>

                      <button
                        type="button"
                        className={`meal-vote-btn meal-vote-no ${
                          votes.myVote === "no"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleVote(
                            poll._id,
                            "no"
                          )
                        }
                        disabled={votingDisabled}
                      >
                        <CloseIcon />

                        <span>NO</span>
                      </button>

                    </div>

                    <div className="meal-poll-results">

                      <div className="meal-poll-result-row">
                        <div>
                          <span>Yes</span>
                          <strong>
                            {votes.yesVotes}
                          </strong>
                        </div>

                        <span>
                          {yesPercentage}%
                        </span>
                      </div>

                      <div className="meal-poll-progress">
                        <div
                          className="meal-poll-progress-yes"
                          style={{
                            width: `${yesPercentage}%`,
                          }}
                        />
                      </div>

                      <div className="meal-poll-result-row">
                        <div>
                          <span>No</span>
                          <strong>
                            {votes.noVotes}
                          </strong>
                        </div>

                        <span>
                          {noPercentage}%
                        </span>
                      </div>

                      <div className="meal-poll-progress">
                        <div
                          className="meal-poll-progress-no"
                          style={{
                            width: `${noPercentage}%`,
                          }}
                        />
                      </div>

                    </div>

                    {votes.myVote && (
                      <div className="meal-poll-your-vote">
                        <CheckIcon />

                        <span>
                          Your vote:
                        </span>

                        <strong>
                          {votes.myVote.toUpperCase()}
                        </strong>
                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default MealPoll;
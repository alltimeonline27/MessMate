import { useEffect, useState } from "react";
import api from "../../services/api";
import "./GeneralPoll.css";

const GeneralPoll = () => {
  const [polls, setPolls] = useState([]);
  const [pollVotes, setPollVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [voting, setVoting] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    question: "",
    options: ["Yes", "No", "Discuss later"],
    deadline: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/general-polls");
      const pollList = response.data.polls || [];

      setPolls(pollList);

      const voteResults = {};

      await Promise.all(
        pollList.map(async (poll) => {
          try {
            const voteResponse = await api.get(
              `/general-poll-votes/${poll._id}`
            );

            voteResults[poll._id] = voteResponse.data;
          } catch (voteError) {
            console.error(
              `Failed to load votes for poll ${poll._id}`,
              voteError
            );
          }
        })
      );

      setPollVotes(voteResults);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load general polls"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPolls();
  }, []);

  const handleQuestionChange = (event) => {
    setFormData({
      ...formData,
      question: event.target.value,
    });
  };

  const handleDeadlineChange = (event) => {
    setFormData({
      ...formData,
      deadline: event.target.value,
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];

    updatedOptions[index] = value;

    setFormData({
      ...formData,
      options: updatedOptions,
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setError("A poll must have at least 2 options");
      return;
    }

    const updatedOptions = formData.options.filter(
      (_, optionIndex) => optionIndex !== index
    );

    setFormData({
      ...formData,
      options: updatedOptions,
    });

    setError("");
  };

  const handleCreatePoll = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const cleanedOptions = formData.options
        .map((option) => option.trim())
        .filter((option) => option.length > 0);

      if (!formData.question.trim()) {
        setError("Poll question is required");
        return;
      }

      if (cleanedOptions.length < 2) {
        setError("At least 2 valid poll options are required");
        return;
      }

      const response = await api.post("/general-polls", {
        question: formData.question.trim(),
        options: cleanedOptions,
        deadline: formData.deadline,
      });

      setMessage(
        response.data.message ||
          "General poll created successfully"
      );

      setFormData({
        question: "",
        options: ["Yes", "No", "Discuss later"],
        deadline: "",
      });

      await fetchPolls();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create general poll"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId, option) => {
    try {
      setVoting(`${pollId}-${option}`);
      setError("");
      setMessage("");

      const response = await api.post(
        `/general-poll-votes/${pollId}`,
        { option }
      );

      setMessage(
        response.data.message ||
          "Vote submitted successfully"
      );

      const voteResponse = await api.get(
        `/general-poll-votes/${pollId}`
      );

      setPollVotes((previous) => ({
        ...previous,
        [pollId]: voteResponse.data,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit vote"
      );
    } finally {
      setVoting(null);
    }
  };

  const isVotingClosed = (poll) => {
    if (poll.status === "closed") {
      return true;
    }

    return new Date(poll.deadline) < new Date();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="general-polls-page">
        <div className="poll-loading">
          <div className="poll-loading-spinner"></div>
          <p>Loading general polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="general-polls-page">

      {/* HEADER */}
      <div className="poll-page-header">
        <div>
          <span className="poll-eyebrow">
            COMMUNITY DECISIONS
          </span>

          <h1>General Polls</h1>

          <p>
            Discuss and vote on important mess-related
            decisions.
          </p>
        </div>

        <div className="poll-role-badge">
          {isAdmin ? "Admin Mode" : "Member View"}
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="poll-alert poll-alert-error">
          <span>!</span>
          {error}
        </div>
      )}

      {message && (
        <div className="poll-alert poll-alert-success">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* CREATE POLL */}
      {isAdmin && (
        <section className="poll-card create-poll-card">

          <div className="poll-section-header">
            <div>
              <span className="poll-section-label">
                ADMIN
              </span>

              <h2>Create General Poll</h2>

              <p>
                Ask your mess members about an important
                decision.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreatePoll}>

            <div className="poll-form-group">
              <label htmlFor="poll-question">
                Question
              </label>

              <input
                id="poll-question"
                type="text"
                value={formData.question}
                onChange={handleQuestionChange}
                placeholder="Example: Should we buy a new water purifier?"
                required
              />
            </div>

            <div className="poll-options-header">
              <div>
                <h3>Poll Options</h3>
                <p>
                  Add at least two options for members to choose.
                </p>
              </div>

              <button
                type="button"
                className="poll-add-button"
                onClick={addOption}
              >
                + Add Option
              </button>
            </div>

            <div className="poll-option-list">
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  className="poll-option-input-row"
                >
                  <div className="poll-option-number">
                    {index + 1}
                  </div>

                  <input
                    type="text"
                    value={option}
                    onChange={(event) =>
                      handleOptionChange(
                        index,
                        event.target.value
                      )
                    }
                    placeholder={`Option ${index + 1}`}
                    required
                  />

                  <button
                    type="button"
                    className="poll-remove-button"
                    onClick={() =>
                      removeOption(index)
                    }
                    disabled={
                      formData.options.length <= 2
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="poll-form-group deadline-group">
              <label htmlFor="poll-deadline">
                Voting Deadline
              </label>

              <input
                id="poll-deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleDeadlineChange}
                required
              />
            </div>

            <button
              type="submit"
              className="poll-primary-button"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Poll"}
            </button>

          </form>
        </section>
      )}

      {/* AVAILABLE POLLS */}
      <section className="available-polls-section">

        <div className="poll-section-title">
          <div>
            <span className="poll-section-label">
              POLLS
            </span>

            <h2>Available Polls</h2>
          </div>

          <span className="poll-count">
            {polls.length}{" "}
            {polls.length === 1 ? "Poll" : "Polls"}
          </span>
        </div>

        {polls.length === 0 ? (
          <div className="poll-empty-card">
            <div className="poll-empty-icon">◉</div>

            <h3>No General Polls</h3>

            <p>
              There are no general polls available right now.
            </p>
          </div>
        ) : (
          polls.map((poll) => {
            const voteData = pollVotes[poll._id];
            const closed = isVotingClosed(poll);

            return (
              <article
                key={poll._id}
                className="poll-card poll-result-card"
              >

                <div className="poll-result-header">

                  <div className="poll-question-area">
                    <h3>{poll.question}</h3>

                    <div className="poll-meta">
                      <span>
                        Created by:{" "}
                        <strong>
                          {poll.createdBy?.name || "Admin"}
                        </strong>
                      </span>

                      <span>
                        Deadline:{" "}
                        {formatDate(poll.deadline)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`poll-status ${
                      closed
                        ? "poll-status-closed"
                        : "poll-status-open"
                    }`}
                  >
                    <span className="poll-status-dot"></span>
                    {closed ? "Closed" : "Open"}
                  </span>

                </div>

                <div className="poll-voting-area">

                  {poll.options.map((option) => {
                    const result =
                      voteData?.results?.find(
                        (item) =>
                          item.option === option
                      );

                    const voteCount =
                      result?.votes || 0;

                    const isMyVote =
                      voteData?.myVote === option;

                    const buttonKey =
                      `${poll._id}-${option}`;

                    return (
                      <div
                        key={option}
                        className="poll-vote-row"
                      >

                        <button
                          type="button"
                          className={`poll-option-button ${
                            isMyVote
                              ? "poll-option-selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleVote(
                              poll._id,
                              option
                            )
                          }
                          disabled={
                            closed ||
                            voting !== null
                          }
                        >
                          <span className="poll-option-text">
                            {voting === buttonKey
                              ? "Submitting..."
                              : option}
                          </span>

                          {isMyVote && (
                            <span className="poll-your-vote">
                              Your Vote
                            </span>
                          )}
                        </button>

                        <span className="poll-vote-count">
                          {voteCount}{" "}
                          {voteCount === 1
                            ? "vote"
                            : "votes"}
                        </span>

                      </div>
                    );
                  })}

                </div>

                <div className="poll-result-footer">

                  <div>
                    Total Votes
                    <strong>
                      {voteData?.totalVotes || 0}
                    </strong>
                  </div>

                  <div>
                    Your Vote
                    <strong>
                      {voteData?.myVote ||
                        "Not voted"}
                    </strong>
                  </div>

                </div>

              </article>
            );
          })
        )}

      </section>

    </div>
  );
};

export default GeneralPoll;
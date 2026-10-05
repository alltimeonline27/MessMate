import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../../services/api";
import Loader from "../../components/Loader";

import "./JoinMess.css";

function JoinMess() {
  const { inviteCode } = useParams();

  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    roomNumber: "",
  });

  useEffect(() => {
    const loadInvite = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/join-requests/invite/${inviteCode}`
        );

        setMess(response.data.mess);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Invalid or expired invite link"
        );
      } finally {
        setLoading(false);
      }
    };

    if (inviteCode) {
      loadInvite();
    }
  }, [inviteCode]);

  const handleChange = (event) => {
    setFormData((previousData) => ({
      ...previousData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await api.post(
        `/join-requests/${inviteCode}`,
        formData
      );

      setMessage(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        roomNumber: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send join request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  /* Invalid / expired invite */
  if (error && !mess) {
    return (
      <div className="join-mess-page">
        <div className="join-mess-shell">
          <div className="join-invalid-card">
            <div className="join-invalid-icon">
              🔗
            </div>

            <span className="join-invalid-label">
              INVITE UNAVAILABLE
            </span>

            <h1>Unable to Join This Mess</h1>

            <p>{error}</p>

            <div className="join-invalid-help">
              <span>💡</span>
              <span>
                Ask the mess admin for a new invite link.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="join-mess-page">
      <div className="join-mess-shell">

        {/* Brand */}
        <div className="join-brand">
          <div className="join-brand-icon">M</div>

          <div>
            <strong>
              Mess<span>Mate</span>
            </strong>

            <small>Mess Management System</small>
          </div>
        </div>

        {/* Main */}
        <div className="join-mess-content">

          {/* Left information */}
          <div className="join-mess-intro">

            <div className="join-welcome-badge">
              👋 You're invited
            </div>

            <h1>
              Join your
              <span> mess community.</span>
            </h1>

            <p>
              Complete the form to send a request to join
              this mess. The mess admin will review your
              request before you become a member.
            </p>

            <div className="join-steps">

              <div className="join-step">
                <div className="join-step-number">1</div>

                <div>
                  <strong>Enter your details</strong>
                  <span>
                    Provide your basic account information.
                  </span>
                </div>
              </div>

              <div className="join-step">
                <div className="join-step-number">2</div>

                <div>
                  <strong>Send join request</strong>
                  <span>
                    Your request will be sent to the admin.
                  </span>
                </div>
              </div>

              <div className="join-step">
                <div className="join-step-number">3</div>

                <div>
                  <strong>Wait for approval</strong>
                  <span>
                    Once approved, you can access the mess.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right side */}
          <div className="join-form-area">

            {/* Mess Card */}
            {mess && (
              <div className="join-mess-card">

                <div className="join-mess-card-icon">
                  🏠
                </div>

                <div className="join-mess-card-info">
                  <small>YOU ARE JOINING</small>

                  <h2>{mess.name}</h2>

                  <div className="join-mess-meta">
                    <span>
                      <strong>Mess ID</strong>
                      {mess.messId}
                    </span>

                    {mess.address && (
                      <span>
                        <strong>Location</strong>
                        {mess.address}
                      </span>
                    )}
                  </div>
                </div>

                <div className="join-active-dot">
                  <span></span>
                  Active
                </div>

              </div>
            )}

            {/* Success */}
            {message ? (
              <div className="join-success-card">

                <div className="join-success-icon">
                  ✓
                </div>

                <span className="join-success-label">
                  REQUEST SENT
                </span>

                <h2>You're all set!</h2>

                <p>{message}</p>

                <div className="join-success-info">
                  <span>✓</span>
                  <div>
                    <strong>What happens next?</strong>
                    <p>
                      The mess admin will review your request.
                      Once accepted, you can log in with the
                      account details you provided.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="join-form-card">

                <div className="join-form-header">
                  <div>
                    <span>MEMBERSHIP REQUEST</span>
                    <h2>Request to Join</h2>
                  </div>

                  <div className="join-form-lock">
                    🔐
                  </div>
                </div>

                <p className="join-form-description">
                  Enter your details below to send a membership
                  request to the mess administrator.
                </p>

                {error && (
                  <div className="join-form-error">
                    <span>!</span>
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  <div className="join-form-group">
                    <label htmlFor="name">
                      Full Name
                    </label>

                    <div className="join-input-wrapper">
                      <span>👤</span>

                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>

                  <div className="join-form-group">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <div className="join-input-wrapper">
                      <span>✉</span>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="join-form-group">
                    <label htmlFor="password">
                      Create Password
                    </label>

                    <div className="join-input-wrapper">
                      <span>🔒</span>

                      <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <small className="join-input-help">
                      Your password must contain at least 6 characters.
                    </small>
                  </div>

                  <div className="join-form-row">

                    <div className="join-form-group">
                      <label htmlFor="phone">
                        Phone Number
                      </label>

                      <div className="join-input-wrapper">
                        <span>☎</span>

                        <input
                          id="phone"
                          type="text"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          required
                        />
                      </div>
                    </div>

                    <div className="join-form-group">
                      <label htmlFor="roomNumber">
                        Room Number
                      </label>

                      <div className="join-input-wrapper">
                        <span>🚪</span>

                        <input
                          id="roomNumber"
                          type="text"
                          name="roomNumber"
                          placeholder="e.g. 601"
                          value={formData.roomNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="join-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="join-submit-spinner"></span>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        Send Join Request
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <p className="join-form-footer">
                    By submitting this request, you agree to
                    provide accurate information to the mess admin.
                  </p>

                </form>

              </div>
            )}

          </div>
        </div>

        <div className="join-page-footer">
          <span>🔒 Secure invitation</span>
          <span>•</span>
          <span>Powered by MessMate</span>
        </div>

      </div>
    </div>
  );
}

export default JoinMess;
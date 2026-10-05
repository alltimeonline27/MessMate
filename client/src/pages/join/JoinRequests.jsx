import { useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";

import "./JoinRequests.css";

function JoinRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      setError("");

      const response = await api.get("/join-requests");

      setRequests(response.data.requests || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load join requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);

  const handleReview = async (requestId, action) => {
    try {
      setReviewing(`${requestId}-${action}`);
      setError("");
      setMessage("");

      const response = await api.put(
        `/join-requests/${requestId}/review`,
        { action }
      );

      setMessage(response.data.message);

      await fetchRequests();

      setTimeout(() => {
        setMessage("");
      }, 3500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to review join request"
      );
    } finally {
      setReviewing(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "join-status-pending";

      case "accepted":
        return "join-status-accepted";

      case "rejected":
        return "join-status-rejected";

      default:
        return "join-status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "◷";

      case "accepted":
        return "✓";

      case "rejected":
        return "×";

      default:
        return "•";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="join-requests-page">
      <div className="join-requests-container">

        {/* Header */}
        <div className="join-requests-header">
          <div className="join-requests-title-area">
            <div className="join-requests-title-icon">
              👥
            </div>

            <div>
              <h1>Join Requests</h1>

              <p>
                Review and manage people requesting to join your mess.
              </p>
            </div>
          </div>

          <div className="join-mess-badge">
            <span>🏠</span>

            <div>
              <small>Mess</small>

              <strong>
                {user?.mess?.name || "Your Mess"}
              </strong>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="join-message join-success">
            <span className="join-message-icon">✓</span>

            <div>
              <strong>Request updated</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="join-message join-error">
            <span className="join-message-icon">!</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button onClick={fetchRequests}>
              Retry
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="join-summary">
          <div>
            <span className="join-summary-icon">📋</span>

            <div>
              <strong>{requests.length}</strong>
              <span>Total Requests</span>
            </div>
          </div>

          <div>
            <span className="join-summary-icon pending-summary">
              ◷
            </span>

            <div>
              <strong>
                {
                  requests.filter(
                    (request) =>
                      request.status === "pending"
                  ).length
                }
              </strong>

              <span>Pending</span>
            </div>
          </div>

          <div>
            <span className="join-summary-icon accepted-summary">
              ✓
            </span>

            <div>
              <strong>
                {
                  requests.filter(
                    (request) =>
                      request.status === "accepted"
                  ).length
                }
              </strong>

              <span>Accepted</span>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="requests-section-header">
          <div>
            <h2>Requests</h2>

            <p>
              Review applications submitted through your invite links.
            </p>
          </div>

          <div className="requests-count-badge">
            {requests.length}
          </div>
        </div>

        {/* Empty */}
        {requests.length === 0 ? (
          <div className="join-empty">
            <div className="join-empty-icon">
              👥
            </div>

            <h3>No join requests</h3>

            <p>
              When someone uses your invite link to request
              membership, their application will appear here.
            </p>
          </div>
        ) : (
          <div className="join-request-list">

            {requests.map((request, index) => {
              const acceptKey = `${request._id}-accept`;
              const rejectKey = `${request._id}-reject`;

              const isAccepting =
                reviewing === acceptKey;

              const isRejecting =
                reviewing === rejectKey;

              const isProcessing =
                reviewing === acceptKey ||
                reviewing === rejectKey;

              return (
                <div
                  className="join-request-card"
                  key={request._id}
                  style={{
                    animationDelay: `${index * 0.06}s`,
                  }}
                >

                  {/* Card Header */}
                  <div className="join-request-top">

                    <div className="applicant-area">
                      <div className="applicant-avatar">
                        {request.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <h3>{request.name}</h3>

                        <span>
                          Join request applicant
                        </span>
                      </div>
                    </div>

                    <div
                      className={`join-status ${getStatusClass(
                        request.status
                      )}`}
                    >
                      <span>
                        {getStatusIcon(
                          request.status
                        )}
                      </span>

                      {request.status}
                    </div>
                  </div>

                  {/* Applicant Information */}
                  <div className="applicant-details">

                    <div className="applicant-detail">
                      <span className="detail-icon">
                        ✉
                      </span>

                      <div>
                        <small>Email</small>
                        <strong>
                          {request.email || "-"}
                        </strong>
                      </div>
                    </div>

                    <div className="applicant-detail">
                      <span className="detail-icon">
                        ☎
                      </span>

                      <div>
                        <small>Phone</small>
                        <strong>
                          {request.phone || "-"}
                        </strong>
                      </div>
                    </div>

                    <div className="applicant-detail">
                      <span className="detail-icon">
                        🚪
                      </span>

                      <div>
                        <small>Room</small>
                        <strong>
                          {request.roomNumber || "-"}
                        </strong>
                      </div>
                    </div>

                    <div className="applicant-detail">
                      <span className="detail-icon">
                        📅
                      </span>

                      <div>
                        <small>Requested</small>

                        <strong>
                          {new Date(
                            request.createdAt
                          ).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  {request.status === "pending" && (
                    <div className="join-request-actions">

                      <span>
                        Review this application
                      </span>

                      <div className="review-buttons">

                        <button
                          type="button"
                          className="reject-btn"
                          onClick={() =>
                            handleReview(
                              request._id,
                              "reject"
                            )
                          }
                          disabled={isProcessing}
                        >
                          {isRejecting ? (
                            <>
                              <span className="action-spinner"></span>
                              Rejecting...
                            </>
                          ) : (
                            <>
                              ✕ Reject
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="accept-btn"
                          onClick={() =>
                            handleReview(
                              request._id,
                              "accept"
                            )
                          }
                          disabled={isProcessing}
                        >
                          {isAccepting ? (
                            <>
                              <span className="action-spinner"></span>
                              Accepting...
                            </>
                          ) : (
                            <>
                              ✓ Accept Member
                            </>
                          )}
                        </button>

                      </div>
                    </div>
                  )}

                  {request.status === "accepted" && (
                    <div className="request-final-state accepted-final">
                      <span>✓</span>
                      <p>
                        This member has been accepted into the mess.
                      </p>
                    </div>
                  )}

                  {request.status === "rejected" && (
                    <div className="request-final-state rejected-final">
                      <span>×</span>
                      <p>
                        This join request was rejected.
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default JoinRequests;
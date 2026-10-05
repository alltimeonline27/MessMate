import { useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";

import "./Invites.css";

function Invites() {
  const { user } = useAuth();

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchInvites = async () => {
    try {
      setError("");

      const response = await api.get("/invites");

      setInvites(response.data.invites || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load invites"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvites();
  }, []);

  const handleCreateInvite = async () => {
    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await api.post("/invites");

      setMessage(response.data.message);

      await fetchInvites();

      setTimeout(() => {
        setMessage("");
      }, 3500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create invite"
      );
    } finally {
      setCreating(false);
    }
  };

  const getInviteLink = (inviteCode) => {
    return `${window.location.origin}/join/${inviteCode}`;
  };

  const copyInviteLink = async (inviteCode, inviteId) => {
    try {
      const inviteLink = getInviteLink(inviteCode);

      await window.navigator.clipboard.writeText(
        inviteLink
      );

      setCopiedId(inviteId);
      setMessage("Invite link copied successfully!");
      setError("");

      setTimeout(() => {
        setCopiedId("");
        setMessage("");
      }, 2500);
    } catch {
      setError("Failed to copy invite link");
      setMessage("");
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "invite-status-active";

      case "expired":
        return "invite-status-expired";

      case "used":
        return "invite-status-used";

      default:
        return "invite-status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "✓";

      case "expired":
        return "⌛";

      case "used":
        return "✓";

      default:
        return "•";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="invites-page">
      <div className="invites-container">

        {/* Header */}
        <div className="invites-header">
          <div className="invites-title-area">
            <div className="invites-title-icon">
              🔗
            </div>

            <div>
              <h1>Mess Invites</h1>

              <p>
                Invite new members to join your mess.
              </p>
            </div>
          </div>

          <div className="invites-mess-badge">
            <span>🏠</span>
            <div>
              <small>Mess</small>
              <strong>
                {user?.mess?.name || "Your Mess"}
              </strong>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="invite-toast invite-success">
            <span className="invite-toast-icon">✓</span>

            <div>
              <strong>Success</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="invite-toast invite-error">
            <span className="invite-toast-icon">!</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Create Invite */}
        {user?.role === "admin" && (
          <div className="create-invite-card">

            <div className="create-invite-content">
              <div className="create-invite-icon">
                ✨
              </div>

              <div>
                <h2>Create Invite Link</h2>

                <p>
                  Generate a secure invite link and share it
                  with someone you want to add to your mess.
                </p>

                <div className="invite-feature-list">
                  <span>✓ Secure invite code</span>
                  <span>✓ Easy to share</span>
                  <span>✓ Time-limited</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="generate-invite-btn"
              onClick={handleCreateInvite}
              disabled={creating}
            >
              {creating ? (
                <>
                  <span className="invite-button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span>＋</span>
                  Generate Invite Link
                </>
              )}
            </button>
          </div>
        )}

        {/* Invite History Header */}
        <div className="invite-history-header">
          <div>
            <h2>Invite History</h2>

            <p>
              {invites.length === 0
                ? "No invite links have been created yet."
                : `${invites.length} invite ${
                    invites.length === 1
                      ? "link"
                      : "links"
                  } created`}
            </p>
          </div>

          <div className="invite-total-badge">
            {invites.length}
          </div>
        </div>

        {/* Empty */}
        {invites.length === 0 ? (
          <div className="invites-empty">
            <div className="invites-empty-icon">
              🔗
            </div>

            <h3>No invites yet</h3>

            <p>
              Create an invite link to let a new member
              request to join your mess.
            </p>

            {user?.role === "admin" && (
              <button
                type="button"
                className="empty-create-btn"
                onClick={handleCreateInvite}
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Your First Invite"}
              </button>
            )}
          </div>
        ) : (
          <div className="invite-list">
            {invites.map((invite, index) => {
              const inviteLink = getInviteLink(
                invite.inviteCode
              );

              return (
                <div
                  className="invite-card"
                  key={invite._id}
                  style={{
                    animationDelay: `${index * 0.06}s`,
                  }}
                >
                  <div className="invite-card-top">

                    <div className="invite-card-title">
                      <div className="invite-link-icon">
                        🔗
                      </div>

                      <div>
                        <span>INVITE LINK</span>

                        <h3>
                          Member Invitation
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`invite-status ${getStatusClass(
                        invite.status
                      )}`}
                    >
                      <span>
                        {getStatusIcon(invite.status)}
                      </span>

                      {invite.status}
                    </div>
                  </div>

                  {/* Link */}
                  <div className="invite-link-box">
                    <span>{inviteLink}</span>

                    {invite.status === "active" && (
                      <button
                        type="button"
                        className="copy-icon-btn"
                        onClick={() =>
                          copyInviteLink(
                            invite.inviteCode,
                            invite._id
                          )
                        }
                        title="Copy invite link"
                      >
                        {copiedId === invite._id
                          ? "✓"
                          : "⧉"}
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="invite-card-info">

                    <div className="invite-info-item">
                      <span className="invite-info-icon">
                        🔑
                      </span>

                      <div>
                        <small>Invite Code</small>
                        <strong>
                          {invite.inviteCode}
                        </strong>
                      </div>
                    </div>

                    <div className="invite-info-item">
                      <span className="invite-info-icon">
                        📅
                      </span>

                      <div>
                        <small>Expires</small>

                        <strong>
                          {new Date(
                            invite.expiresAt
                          ).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Action */}
                  {invite.status === "active" && (
                    <div className="invite-card-footer">
                      <span>
                        Share this link with the new member.
                      </span>

                      <button
                        type="button"
                        className="copy-invite-btn"
                        onClick={() =>
                          copyInviteLink(
                            invite.inviteCode,
                            invite._id
                          )
                        }
                      >
                        {copiedId === invite._id ? (
                          <>
                            ✓ Copied
                          </>
                        ) : (
                          <>
                            ⧉ Copy Invite Link
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {invite.status !== "active" && (
                    <div className="invite-card-footer invite-inactive-footer">
                      <span>
                        This invite link is no longer active.
                      </span>
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

export default Invites;
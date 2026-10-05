import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

import "./Members.css";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6.5 4.5 9 4l2 4-2 1.5c1 2 2.5 3.5 4.5 4.5L15 12l4 2 .5 2.5c.2 1-.5 2-1.5 2-7.2 0-13-5.8-13-13 0-1 .9-1.7 1.5-2Z" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Members() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    roomNumber: "",
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/members");

      setMembers(response.data.members || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load members"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      try {
        setError("");

        const response = await api.get("/members");

        if (!cancelled) {
          setMembers(response.data.members || []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
            "Failed to load members"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMembers();

    return () => {
      cancelled = true;
    };
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setAdding(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/members",
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

      setShowAddForm(false);

      await fetchMembers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to add member"
      );
    } finally {
      setAdding(false);
    }
  };

  const handlePromote = async (userId) => {
    try {
      setUpdatingRole(userId);
      setError("");
      setMessage("");

      const response = await api.put(
        `/members/${userId}/promote`
      );

      setMessage(response.data.message);

      await fetchMembers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to promote member"
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDemote = async (userId) => {
    try {
      setUpdatingRole(userId);
      setError("");
      setMessage("");

      const response = await api.put(
        `/members/${userId}/demote`
      );

      setMessage(response.data.message);

      await fetchMembers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to demote admin"
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return members;

    return members.filter((member) => {
      const memberUser = member.userId;

      return (
        member.name?.toLowerCase().includes(keyword) ||
        member.email?.toLowerCase().includes(keyword) ||
        member.phone?.toLowerCase().includes(keyword) ||
        member.roomNumber
          ?.toString()
          .toLowerCase()
          .includes(keyword) ||
        memberUser?.role?.toLowerCase().includes(keyword)
      );
    });
  }, [members, search]);

  const adminCount = members.filter(
    (member) => member.userId?.role === "admin"
  ).length;

  const activeCount = members.filter(
    (member) => member.status === "active"
  ).length;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="members-page">
      <div className="members-container">

        {/* PAGE HEADER */}
        <section className="members-heading">
          <div>
            <span className="members-eyebrow">
              MESS MANAGEMENT
            </span>

            <h1>Members</h1>

            <p>
              Manage your mess members, roles and
              account access.
            </p>
          </div>

          {user?.role === "admin" && (
            <button
              type="button"
              className="members-add-btn"
              onClick={() => {
                setShowAddForm((previous) => !previous);
                setError("");
                setMessage("");
              }}
            >
              <PlusIcon />
              <span>
                {showAddForm
                  ? "Close Form"
                  : "Add Member"}
              </span>
            </button>
          )}
        </section>

        {/* TOAST */}
        <div className="members-toast-container">
          {message && (
            <div className="members-toast members-toast-success">
              <span className="members-toast-icon">
                ✓
              </span>

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
            <div className="members-toast members-toast-error">
              <span className="members-toast-icon">
                !
              </span>

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

        {/* STATS */}
        <section className="members-stats">

          <div className="member-stat-card">
            <div className="member-stat-icon">
              <UserIcon />
            </div>

            <div>
              <span>Total Members</span>
              <strong>{members.length}</strong>
            </div>
          </div>

          <div className="member-stat-card">
            <div className="member-stat-icon">
              <ShieldIcon />
            </div>

            <div>
              <span>Admins</span>
              <strong>{adminCount}</strong>
            </div>
          </div>

          <div className="member-stat-card">
            <div className="member-stat-icon">
              <UserIcon />
            </div>

            <div>
              <span>Active Members</span>
              <strong>{activeCount}</strong>
            </div>
          </div>

        </section>

        {/* ADD MEMBER */}
        {showAddForm && user?.role === "admin" && (
          <section className="members-add-card">

            <div className="members-section-header">
              <div>
                <span className="members-card-label">
                  NEW MEMBER
                </span>

                <h2>Add a Member</h2>

                <p>
                  Create an account for a new member
                  of your mess.
                </p>
              </div>

              <div className="members-section-icon">
                <PlusIcon />
              </div>
            </div>

            <form
              className="members-form"
              onSubmit={handleSubmit}
            >
              <div className="members-form-grid">

                <div className="members-field">
                  <label htmlFor="member-name">
                    Full Name
                  </label>

                  <input
                    id="member-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter member name"
                    required
                  />
                </div>

                <div className="members-field">
                  <label htmlFor="member-email">
                    Email
                  </label>

                  <input
                    id="member-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="member@email.com"
                    required
                  />
                </div>

                <div className="members-field">
                  <label htmlFor="member-password">
                    Temporary Password
                  </label>

                  <input
                    id="member-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create temporary password"
                    required
                  />
                </div>

                <div className="members-field">
                  <label htmlFor="member-phone">
                    Phone Number
                  </label>

                  <input
                    id="member-phone"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="members-field">
                  <label htmlFor="member-room">
                    Room Number
                  </label>

                  <input
                    id="member-room"
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g. 101"
                    required
                  />
                </div>

              </div>

              <div className="members-form-actions">

                <button
                  type="button"
                  className="members-cancel-btn"
                  onClick={() => setShowAddForm(false)}
                  disabled={adding}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="members-save-btn"
                  disabled={adding}
                >
                  {adding
                    ? "Creating..."
                    : "Create Member"}
                </button>

              </div>
            </form>
          </section>
        )}

        {/* MEMBERS LIST */}
        <section className="members-list-section">

          <div className="members-list-header">

            <div>
              <span className="members-card-label">
                YOUR MESS
              </span>

              <h2>
                All Members
                <span>{members.length}</span>
              </h2>
            </div>

            <div className="members-search">
              <SearchIcon />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search members..."
              />
            </div>

          </div>

          {filteredMembers.length === 0 ? (
            <div className="members-empty">
              {members.length === 0 ? (
                <EmptyState message="No members added yet." />
              ) : (
                <>
                  <div className="members-empty-icon">
                    <SearchIcon />
                  </div>

                  <h3>No members found</h3>

                  <p>
                    Try searching with another name,
                    email or room number.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="members-grid">

              {filteredMembers.map(
                (member, index) => {
                  const memberUser = member.userId;

                  const memberRole =
                    memberUser?.role || "member";

                  const memberUserId =
                    memberUser?._id;

                  const isCurrentUser =
                    String(memberUserId) ===
                    String(user?.id);

                  const isActive =
                    member.status === "active";

                  const initials =
                    member.name
                      ?.split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "M";

                  return (
                    <article
                      className="member-card"
                      key={member._id}
                      style={{
                        "--member-delay": `${index * 0.06}s`,
                      }}
                    >

                      <div className="member-card-top">

                        <div className="member-avatar">
                          {initials}
                        </div>

                        <div className="member-main-info">
                          <h3>{member.name}</h3>

                          <span>
                            {member.email}
                          </span>
                        </div>

                        <span
                          className={`member-role role-${memberRole}`}
                        >
                          {memberRole === "admin"
                            ? "Admin"
                            : "Member"}
                        </span>

                      </div>

                      <div className="member-details">

                        <div className="member-detail">
                          <PhoneIcon />

                          <div>
                            <span>Phone</span>
                            <strong>
                              {member.phone ||
                                "Not added"}
                            </strong>
                          </div>
                        </div>

                        <div className="member-detail">
                          <RoomIcon />

                          <div>
                            <span>Room</span>
                            <strong>
                              {member.roomNumber ||
                                "Not added"}
                            </strong>
                          </div>
                        </div>

                      </div>

                      <div className="member-card-footer">

                        <span
                          className={`member-status ${isActive
                              ? "status-active"
                              : "status-inactive"
                            }`}
                        >
                          <i></i>

                          {isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <button
                          type="button"
                          className="member-view-btn"
                          onClick={() =>
                            navigate(
                              `/members/${member._id}`
                            )
                          }
                        >
                          View Details
                          <ArrowIcon />
                        </button>

                      </div>

                      {user?.role === "admin" &&
                        memberUserId &&
                        !isCurrentUser && (
                          <div className="member-admin-actions">

                            {memberRole === "member" && (
                              <button
                                type="button"
                                className="member-promote-btn"
                                onClick={() =>
                                  handlePromote(
                                    memberUserId
                                  )
                                }
                                disabled={
                                  updatingRole ===
                                  memberUserId
                                }
                              >
                                {updatingRole ===
                                  memberUserId
                                  ? "Updating..."
                                  : "Promote to Admin"}
                              </button>
                            )}

                            {memberRole === "admin" && (
                              <button
                                type="button"
                                className="member-demote-btn"
                                onClick={() =>
                                  handleDemote(
                                    memberUserId
                                  )
                                }
                                disabled={
                                  updatingRole ===
                                  memberUserId
                                }
                              >
                                {updatingRole ===
                                  memberUserId
                                  ? "Updating..."
                                  : "Demote to Member"}
                              </button>
                            )}

                          </div>
                        )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default Members;
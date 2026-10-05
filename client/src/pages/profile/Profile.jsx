import { useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";

import "./Profile.css";

function UserIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 3.5h3l1.5 4-2 1.5c1 2.1 2.7 3.8 4.8 4.8l1.5-2 4 1.5v3c0 1-1 1.7-2 1.7C10.5 18 6 13.5 6 8.7c0-1 .5-2 1.5-2Z" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v15" />
      <path d="M2 20h20" />
      <path d="M9 8h5M9 12h5M9 16h5" />
    </svg>
  );
}

function MessIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
      <path d="M2 21h20" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    roomNumber: "",
  });

  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
  if (!message && !error) return;

  const timer = setTimeout(() => {
    setMessage("");
    setError("");
  }, 3500);

  return () => clearTimeout(timer);
}, [message, error]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/profile/me");

        setProfile(response.data);

        setFormData({
          name: response.data.user?.name || "",
          phone: response.data.member?.phone || "",
          roomNumber: response.data.member?.roomNumber || "",
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const response = await api.put("/profile/me", formData);

      setMessage(response.data.message);

      setProfile((previous) => ({
        ...previous,
        user: response.data.user,
        member: response.data.member,
      }));

      setEditing(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = () => {
    setMessage("");
    setError("");

    setFormData({
      name: profile?.user?.name || "",
      phone: profile?.member?.phone || "",
      roomNumber: profile?.member?.roomNumber || "",
    });

    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setMessage("");
    setError("");
  };

  if (loading) {
    return <Loader />;
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error-card">
          <h2>Unable to load profile</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const profileUser = profile?.user;
  const member = profile?.member;

  const role =
    profileUser?.role === "admin"
      ? "Admin"
      : profileUser?.role === "superAdmin"
        ? "Super Admin"
        : "Member";

  const messName =
    profileUser?.messId?.name ||
    user?.mess?.name ||
    "-";

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Header */}
        <section className="profile-heading">
          <div>
            <span className="profile-eyebrow">
              ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information and mess
              account details.
            </p>
          </div>
        </section>

        {/* Toast Messages */}
        <div className="profile-toast-container">
          {message && (
            <div className="profile-toast profile-toast-success">
              <div className="profile-toast-icon">✓</div>

              <div className="profile-toast-content">
                <strong>Success</strong>
                <span>{message}</span>
              </div>

              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          )}

          {error && profile && (
            <div className="profile-toast profile-toast-error">
              <div className="profile-toast-icon">!</div>

              <div className="profile-toast-content">
                <strong>Something went wrong</strong>
                <span>{error}</span>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <>
            {/* Profile hero */}
            <section className="profile-hero">
              <div className="profile-avatar">
                <UserIcon />
              </div>

              <div className="profile-hero-info">
                <h2>{profileUser?.name || "-"}</h2>

                <div className="profile-email">
                  <MailIcon />
                  <span>{profileUser?.email || "-"}</span>
                </div>
              </div>

              <div className="profile-hero-actions">
                <span className={`profile-role role-${profileUser?.role}`}>
                  {role}
                </span>

                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={startEditing}
                >
                  <EditIcon />
                  <span>Edit Profile</span>
                </button>
              </div>
            </section>

            {/* Information cards */}
            <div className="profile-grid">

              {/* Personal information */}
              <section className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <span className="profile-card-label">
                      PERSONAL
                    </span>

                    <h3>Personal Information</h3>
                  </div>

                  <div className="profile-card-icon">
                    <UserIcon />
                  </div>
                </div>

                <div className="profile-info-list">

                  <div className="profile-info-item">
                    <div className="profile-info-icon">
                      <UserIcon />
                    </div>

                    <div>
                      <span>Name</span>
                      <strong>
                        {profileUser?.name || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-icon">
                      <MailIcon />
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>
                        {profileUser?.email || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-icon">
                      <PhoneIcon />
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>
                        {member?.phone || "Not added"}
                      </strong>
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-icon">
                      <RoomIcon />
                    </div>

                    <div>
                      <span>Room Number</span>
                      <strong>
                        {member?.roomNumber || "Not added"}
                      </strong>
                    </div>
                  </div>

                </div>
              </section>

              {/* Mess information */}
              <section className="profile-card">
                <div className="profile-card-header">
                  <div>
                    <span className="profile-card-label">
                      MESS
                    </span>

                    <h3>Mess Information</h3>
                  </div>

                  <div className="profile-card-icon">
                    <MessIcon />
                  </div>
                </div>

                <div className="profile-mess-box">
                  <div className="profile-mess-icon">
                    <MessIcon />
                  </div>

                  <div>
                    <span>Current Mess</span>
                    <strong>{messName}</strong>
                  </div>
                </div>

                <div className="profile-detail-row">
                  <span>Account Role</span>
                  <strong>{role}</strong>
                </div>

                <div className="profile-detail-row">
                  <span>Account Status</span>

                  <strong className="profile-status">
                    <i></i>
                    Active
                  </strong>
                </div>
              </section>
            </div>

            {/* Security */}
            <section className="profile-security-card">
              <div className="profile-security-icon">
                <LockIcon />
              </div>

              <div className="profile-security-content">
                <span>ACCOUNT SECURITY</span>
                <h3>Password & Security</h3>
                <p>
                  Keep your account secure with a strong
                  password.
                </p>
              </div>

              <button
                type="button"
                className="profile-password-btn"
                disabled
              >
                Change Password
              </button>
            </section>
          </>
        ) : (
          /* Edit mode */
          <section className="profile-edit-card">
            <div className="profile-edit-header">
              <div>
                <span className="profile-card-label">
                  EDIT PROFILE
                </span>

                <h2>Update your information</h2>

                <p>
                  Change the details you want to keep
                  updated.
                </p>
              </div>

              <div className="profile-edit-avatar">
                <UserIcon />
              </div>
            </div>

            <form
              className="profile-form"
              onSubmit={handleUpdate}
            >
              <div className="profile-form-grid">

                <div className="profile-field">
                  <label htmlFor="profile-name">
                    Full Name
                  </label>

                  <div className="profile-input-wrap">
                    <UserIcon />

                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label>Email</label>

                  <div className="profile-input-wrap profile-input-disabled">
                    <MailIcon />

                    <input
                      type="email"
                      value={profileUser?.email || ""}
                      disabled
                    />
                  </div>

                  <small>
                    Email cannot be changed.
                  </small>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-phone">
                    Phone Number
                  </label>

                  <div className="profile-input-wrap">
                    <PhoneIcon />

                    <input
                      id="profile-phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-room">
                    Room Number
                  </label>

                  <div className="profile-input-wrap">
                    <RoomIcon />

                    <input
                      id="profile-room"
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="Enter room number"
                    />
                  </div>
                </div>

              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={cancelEditing}
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={updating}
                >
                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

export default Profile;
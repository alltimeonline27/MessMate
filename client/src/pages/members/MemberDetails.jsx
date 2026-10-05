import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import Loader from "../../components/Loader";

import "./MemberDetails.css";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="m5 7 7 5 7-5" />
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MealIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 3v8M8 3v8M11 3v8M8 11v10" />
      <path d="M17 3v18M17 3c2 1.4 3 3.5 3 6v2h-6V9c0-2.5 1-4.6 3-6Z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.5c-.5-.7-1.3-1-2.4-1-1.4 0-2.3.7-2.3 1.7 0 2.6 5 1.1 5 3.8 0 1-.9 1.7-2.5 1.7-1.2 0-2.1-.4-2.7-1.2M12 7v10" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMember = async () => {
      try {
        setError("");

        const response = await api.get(`/members/${id}`);

        if (!cancelled) {
          setMember(response.data.member || response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Failed to load member details"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMember();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (error || !member) {
    return (
      <div className="member-details-page">
        <div className="member-details-error">
          <div className="member-details-error-icon">
            !
          </div>

          <h2>Unable to load member</h2>

          <p>
            {error || "Member details could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/members")}
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  const memberUser = member.userId || member.user || {};

  const name =
    member.name ||
    memberUser.name ||
    "Unknown Member";

  const email =
    member.email ||
    memberUser.email ||
    "Not available";

  const phone = member.phone || "Not added";

  const roomNumber =
    member.roomNumber || "Not added";

  const role =
    memberUser.role ||
    member.role ||
    "member";

  const status =
    member.status || "active";

  const totalMeals =
    member.totalMeals ??
    member.meals ??
    null;

  const totalBill =
    member.totalBill ??
    member.bill ??
    null;

  const paidAmount =
    member.paidAmount ??
    member.paid ??
    null;

  const dueAmount =
    member.dueAmount ??
    member.due ??
    null;

  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";

  const isActive = status === "active";

  return (
    <div className="member-details-page">
      <div className="member-details-container">

        {/* PAGE HEADER */}
        <section className="member-details-heading">

          <button
            type="button"
            className="member-back-btn"
            onClick={() => navigate("/members")}
          >
            <ArrowIcon />
            <span>Back to Members</span>
          </button>

          <div>
            <span className="member-details-eyebrow">
              MEMBER PROFILE
            </span>

            <h1>Member Details</h1>

            <p>
              View personal information and mess
              account details.
            </p>
          </div>

        </section>

        {/* HERO */}
        <section className="member-details-hero">

          <div className="member-details-avatar">
            {initials}
          </div>

          <div className="member-details-hero-info">
            <h2>{name}</h2>

            <div className="member-details-email">
              <MailIcon />
              <span>{email}</span>
            </div>
          </div>

          <div className="member-details-hero-meta">

            <span
              className={`member-details-role role-${role}`}
            >
              {role === "admin"
                ? "Admin"
                : "Member"}
            </span>

            <span
              className={`member-details-status ${
                isActive
                  ? "status-active"
                  : "status-inactive"
              }`}
            >
              <i></i>
              {isActive ? "Active" : "Inactive"}
            </span>

          </div>

        </section>

        {/* PERSONAL INFORMATION */}
        <section className="member-details-card">

          <div className="member-details-card-header">

            <div>
              <span className="member-details-card-label">
                PERSONAL
              </span>

              <h3>Personal Information</h3>
            </div>

            <div className="member-details-card-icon">
              <UserIcon />
            </div>

          </div>

          <div className="member-info-grid">

            <div className="member-info-item">
              <div className="member-info-icon">
                <UserIcon />
              </div>

              <div>
                <span>Name</span>
                <strong>{name}</strong>
              </div>
            </div>

            <div className="member-info-item">
              <div className="member-info-icon">
                <MailIcon />
              </div>

              <div>
                <span>Email</span>
                <strong>{email}</strong>
              </div>
            </div>

            <div className="member-info-item">
              <div className="member-info-icon">
                <PhoneIcon />
              </div>

              <div>
                <span>Phone</span>
                <strong>{phone}</strong>
              </div>
            </div>

            <div className="member-info-item">
              <div className="member-info-icon">
                <RoomIcon />
              </div>

              <div>
                <span>Room Number</span>
                <strong>{roomNumber}</strong>
              </div>
            </div>

          </div>

        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="member-details-card">

          <div className="member-details-card-header">

            <div>
              <span className="member-details-card-label">
                ACCOUNT
              </span>

              <h3>Account Information</h3>
            </div>

            <div className="member-details-card-icon">
              <ShieldIcon />
            </div>

          </div>

          <div className="member-account-grid">

            <div className="member-account-item">
              <span>Account Role</span>

              <strong>
                {role === "admin"
                  ? "Admin"
                  : "Member"}
              </strong>
            </div>

            <div className="member-account-item">
              <span>Account Status</span>

              <strong
                className={
                  isActive
                    ? "account-active"
                    : "account-inactive"
                }
              >
                <i></i>
                {isActive
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

          </div>

        </section>

        {/* MESS SUMMARY */}
        <section className="member-details-card">

          <div className="member-details-card-header">

            <div>
              <span className="member-details-card-label">
                MESS ACTIVITY
              </span>

              <h3>Meal & Payment Summary</h3>
            </div>

            <div className="member-details-card-icon">
              <MealIcon />
            </div>

          </div>

          <div className="member-summary-grid">

            <div className="member-summary-card">
              <div className="member-summary-icon">
                <MealIcon />
              </div>

              <div>
                <span>Total Meals</span>

                <strong>
                  {totalMeals !== null
                    ? totalMeals
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="member-summary-card">
              <div className="member-summary-icon">
                <MoneyIcon />
              </div>

              <div>
                <span>Total Bill</span>

                <strong>
                  {totalBill !== null
                    ? `₹${totalBill}`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="member-summary-card">
              <div className="member-summary-icon">
                <MoneyIcon />
              </div>

              <div>
                <span>Paid Amount</span>

                <strong className="summary-paid">
                  {paidAmount !== null
                    ? `₹${paidAmount}`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="member-summary-card">
              <div className="member-summary-icon">
                <MoneyIcon />
              </div>

              <div>
                <span>Due Amount</span>

                <strong className="summary-due">
                  {dueAmount !== null
                    ? `₹${dueAmount}`
                    : "—"}
                </strong>
              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default MemberDetails;
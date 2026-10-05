import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "./Payments.css";

function Payments() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [notices, setNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [messInfo, setMessInfo] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [selectedNotice, setSelectedNotice] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotices = useCallback(async () => {
    try {
      const response = await api.get("/payments/notices");

      if (response.data.success) {
        setNotices(response.data.notices || []);
      }
    } catch (error) {
      console.error(
        "Failed to load payment notices:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load payment notices"
      );
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const response = await api.get(
        isAdmin ? "/payments/all" : "/payments/my"
      );

      if (response.data.success) {
        setPayments(response.data.payments || []);
      }
    } catch (error) {
      console.error(
        "Failed to load payments:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load payments"
      );
    }
  }, [isAdmin]);

  const loadPaymentSummary = useCallback(async () => {
    if (isAdmin) return;

    try {
      const response = await api.get("/payments/my-summary");

      if (response.data.success) {
        setPaymentSummary(response.data.summary || []);
      }
    } catch (error) {
      console.error(
        "Failed to load payment summary:",
        error.response?.data || error.message
      );
    }
  }, [isAdmin]);

  const loadMessInfo = useCallback(async () => {
    try {
      const response = await api.get("/mess/me");

      if (response.data.success) {
        setMessInfo(response.data.mess);
      }
    } catch (error) {
      console.error(
        "Failed to load mess payment settings:",
        error.response?.data || error.message
      );
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadNotices(),
        loadPayments(),
        loadPaymentSummary(),
        loadMessInfo(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    loadNotices,
    loadPayments,
    loadPaymentSummary,
    loadMessInfo,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [message, error]);

  const createNotice = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.post("/payments/notices", {
        title,
        amount: Number(amount),
        dueDate,
        description,
      });

      if (response.data.success) {
        setMessage("Payment notice created successfully.");

        setTitle("");
        setAmount("");
        setDueDate("");
        setDescription("");

        await loadNotices();
      }
    } catch (error) {
      console.error(
        "Failed to create payment notice:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to create payment notice"
      );
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.post("/payments/submit", {
        paymentNoticeId: selectedNotice,
        amount: Number(paymentAmount),
        paymentMethod,
        transactionId:
          paymentMethod === "upi" ? transactionId : "",
        note: paymentNote,
      });

      if (response.data.success) {
        setMessage("Payment submitted successfully.");

        setSelectedNotice("");
        setPaymentAmount("");
        setTransactionId("");
        setPaymentNote("");

        await loadPayments();
        await loadPaymentSummary();
      }
    } catch (error) {
      console.error(
        "Failed to submit payment:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to submit payment"
      );
    } finally {
      setSaving(false);
    }
  };

  const closeNotice = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this payment notice?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await api.put(
        `/payments/notices/${id}/close`
      );

      if (response.data.success) {
        setMessage("Payment notice closed successfully.");
        await loadNotices();
      }
    } catch (error) {
      console.error(
        "Failed to close payment notice:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to close payment notice"
      );
    }
  };

  const verifyPayment = async (id, status) => {
    try {
      setError("");
      setMessage("");

      const response = await api.put(
        `/payments/${id}/verify`,
        { status }
      );

      if (response.data.success) {
        setMessage(
          status === "successful"
            ? "Payment verified successfully."
            : "Payment rejected successfully."
        );

        await loadPayments();
        await loadPaymentSummary();
      }
    } catch (error) {
      console.error(
        "Failed to update payment:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to update payment"
      );
    }
  };

  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const getStatusClass = (status) => {
    if (status === "successful") return "status-success";
    if (status === "rejected") return "status-rejected";
    if (status === "pending_verification")
      return "status-pending";
    if (status === "pending") return "status-pending";
    if (status === "partial") return "status-partial";
    if (status === "active") return "status-active";
    if (status === "closed") return "status-closed";

    return "";
  };

  if (loading) {
    return (
      <div className="payments-page">
        <div className="payments-loading">
          <div className="payments-spinner"></div>
          <h2>Loading Payments</h2>
          <p>Please wait while we load your payment data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      {/* PAGE HEADER */}
      <div className="payments-header">
        <div>
          <span className="payments-eyebrow">
            MESS FINANCE
          </span>

          <h1>Payments</h1>

          <p>
            Manage mess payment notices and payment
            submissions.
          </p>
        </div>

        <div className="payments-header-icon">
          ₹
        </div>
      </div>

      {/* TOASTS */}
      <div className="payments-toast-container">
        {message && (
          <div className="payments-toast payments-toast-success">
            <div className="payments-toast-icon">✓</div>

            <div>
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

        {error && (
          <div className="payments-toast payments-toast-error">
            <div className="payments-toast-icon">!</div>

            <div>
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

      {/* ADMIN: CREATE PAYMENT NOTICE */}
      {isAdmin && (
        <section className="payment-card payment-create-section">
          <div className="payment-card-header">
            <div>
              <span className="payment-card-eyebrow">
                ADMIN
              </span>

              <h2>Create Payment Notice</h2>

              <p>
                Create a payment request for your mess
                members.
              </p>
            </div>

            <div className="payment-card-icon">+</div>
          </div>

          <form
            className="payment-form"
            onSubmit={createNotice}
          >
            <div className="payment-form-grid">
              <div className="payment-field">
                <label htmlFor="payment-title">
                  Title
                </label>

                <input
                  id="payment-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="October Mess Payment"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="payment-amount">
                  Amount
                </label>

                <input
                  id="payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="3000"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="payment-due-date">
                  Due Date
                </label>

                <input
                  id="payment-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  required
                />
              </div>

              <div className="payment-field payment-field-full">
                <label htmlFor="payment-description">
                  Description
                </label>

                <textarea
                  id="payment-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="October mess payment"
                  rows="4"
                />
              </div>
            </div>

            <div className="payment-form-footer">
              <p>
                This payment notice will be visible to
                members of your mess.
              </p>

              <button
                type="submit"
                className="payment-primary-btn"
                disabled={saving}
              >
                <span>+</span>

                {saving
                  ? "Creating..."
                  : "Create Payment Notice"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* MEMBER: PAYMENT SUMMARY */}
      {!isAdmin && (
        <section className="payment-card payment-summary-section">
          <div className="payment-card-header">
            <div>
              <span className="payment-card-eyebrow">
                OVERVIEW
              </span>

              <h2>Payment Summary</h2>

              <p>
                See your total payment, paid amount and
                remaining due.
              </p>
            </div>

            <div className="payment-card-icon">₹</div>
          </div>

          {paymentSummary.length === 0 ? (
            <div className="payment-empty-state">
              <div className="payment-empty-icon">
                ₹
              </div>

              <h3>No payment summary</h3>

              <p>
                No payment summary is available yet.
              </p>
            </div>
          ) : (
            <div className="payment-table-wrap">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {paymentSummary.map((item) => (
                    <tr key={item.paymentNoticeId}>
                      <td>
                        <strong className="payment-title-cell">
                          {item.title}
                        </strong>
                      </td>

                      <td>
                        ₹
                        {Number(item.noticeAmount).toFixed(
                          2
                        )}
                      </td>

                      <td className="paid-value">
                        ₹
                        {Number(item.totalPaid).toFixed(
                          2
                        )}
                      </td>

                      <td>
                        <strong className="due-value">
                          ₹{Number(item.due).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        {new Date(
                          item.dueDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* PAYMENT NOTICES */}
      <section className="payment-notices-section">
        <div className="section-heading-row">
          <div>
            <span className="payment-card-eyebrow">
              NOTICES
            </span>

            <h2>Payment Notices</h2>

            <p>
              Active and previous payment requests from
              your mess.
            </p>
          </div>
        </div>

        {notices.length === 0 ? (
          <div className="payment-empty-state payment-empty-card">
            <div className="payment-empty-icon">
              ₹
            </div>

            <h3>No payment notices found</h3>

            <p>
              Payment notices created for this mess will
              appear here.
            </p>
          </div>
        ) : (
          <div className="payment-notices-grid">
            {notices.map((notice) => (
              <article
                className="payment-notice-card"
                key={notice._id}
              >
                <div className="notice-card-top">
                  <div className="notice-money-icon">
                    ₹
                  </div>

                  <span
                    className={`payment-status ${getStatusClass(
                      notice.status
                    )}`}
                  >
                    {formatStatus(notice.status)}
                  </span>
                </div>

                <h3>{notice.title}</h3>

                <div className="notice-amount">
                  ₹{Number(notice.amount).toFixed(2)}
                </div>

                <div className="notice-details">
                  <div>
                    <span>Due Date</span>

                    <strong>
                      {new Date(
                        notice.dueDate
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>

                    <strong>
                      {formatStatus(notice.status)}
                    </strong>
                  </div>
                </div>

                {notice.description && (
                  <div className="notice-description">
                    <span>Description</span>

                    <p>{notice.description}</p>
                  </div>
                )}

                {isAdmin &&
                  notice.status === "active" && (
                    <button
                      type="button"
                      className="notice-close-btn"
                      onClick={() =>
                        closeNotice(notice._id)
                      }
                    >
                      Close Notice
                    </button>
                  )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MEMBER: PAYMENT INFORMATION */}
      {!isAdmin && (
        <section className="payment-card payment-info-section">
          <div className="payment-card-header">
            <div>
              <span className="payment-card-eyebrow">
                PAYMENT METHOD
              </span>

              <h2>Mess Payment Information</h2>

              <p>
                Use the configured UPI details to make
                your payment.
              </p>
            </div>

            <div className="payment-card-icon">
              UPI
            </div>
          </div>

          <div className="payment-info-content">
            <div className="upi-info-box">
              <span>UPI ID</span>

              <strong>
                {messInfo?.paymentSettings?.upiId ||
                  "Not configured"}
              </strong>
            </div>

            {messInfo?.paymentSettings?.qrCode && (
              <div className="qr-section">
                <div>
                  <span className="qr-label">
                    SCAN & PAY
                  </span>

                  <h3>Scan QR Code to Pay</h3>

                  <p>
                    Open your UPI app and scan this
                    QR code.
                  </p>
                </div>

                <div className="qr-wrapper">
                  <img
                    src={
                      messInfo.paymentSettings.qrCode
                    }
                    alt="Mess UPI QR Code"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MEMBER: SUBMIT PAYMENT */}
      {!isAdmin && notices.length > 0 && (
        <section className="payment-card payment-submit-section">
          <div className="payment-card-header">
            <div>
              <span className="payment-card-eyebrow">
                MEMBER
              </span>

              <h2>Submit Payment</h2>

              <p>
                Submit your payment details for admin
                verification.
              </p>
            </div>

            <div className="payment-card-icon">↗</div>
          </div>

          <form
            className="payment-form"
            onSubmit={submitPayment}
          >
            <div className="payment-form-grid">
              <div className="payment-field payment-field-full">
                <label htmlFor="selected-notice">
                  Payment Notice
                </label>

                <select
                  id="selected-notice"
                  value={selectedNotice}
                  onChange={(event) =>
                    setSelectedNotice(
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select payment notice
                  </option>

                  {notices
                    .filter(
                      (notice) =>
                        notice.status === "active"
                    )
                    .map((notice) => (
                      <option
                        key={notice._id}
                        value={notice._id}
                      >
                        {notice.title} - ₹
                        {notice.amount}
                      </option>
                    ))}
                </select>
              </div>

              <div className="payment-field">
                <label htmlFor="payment-submit-amount">
                  Payment Amount
                </label>

                <input
                  id="payment-submit-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(
                      event.target.value
                    )
                  }
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="payment-method">
                  Payment Method
                </label>

                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                >
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {paymentMethod === "upi" && (
                <div className="payment-field payment-field-full">
                  <label htmlFor="transaction-id">
                    Transaction ID / UTR
                  </label>

                  <input
                    id="transaction-id"
                    type="text"
                    value={transactionId}
                    onChange={(event) =>
                      setTransactionId(
                        event.target.value
                      )
                    }
                    placeholder="Enter UTR / Transaction ID"
                    required
                  />
                </div>
              )}

              <div className="payment-field payment-field-full">
                <label htmlFor="payment-note">
                  Note
                </label>

                <textarea
                  id="payment-note"
                  value={paymentNote}
                  onChange={(event) =>
                    setPaymentNote(
                      event.target.value
                    )
                  }
                  placeholder="Optional note"
                  rows="4"
                />
              </div>
            </div>

            <div className="payment-form-footer">
              <p>
                Your payment will remain pending until an
                admin verifies it.
              </p>

              <button
                type="submit"
                className="payment-primary-btn"
                disabled={saving}
              >
                <span>↗</span>

                {saving
                  ? "Submitting..."
                  : "Submit Payment"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PAYMENT HISTORY */}
      <section className="payment-history-section">
        <div className="section-heading-row">
          <div>
            <span className="payment-card-eyebrow">
              RECORDS
            </span>

            <h2>
              {isAdmin
                ? "All Payment Records"
                : "My Payment History"}
            </h2>

            <p>
              Review previous payment activity and
              verification status.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="payment-empty-state payment-empty-card">
            <div className="payment-empty-icon">
              ₹
            </div>

            <h3>No payment records found</h3>

            <p>
              Payment activity will appear here once
              available.
            </p>
          </div>
        ) : (
          <div className="payment-history-card">
            <div className="payment-table-wrap">
              <table className="payment-table payment-history-table">
                <thead>
                  <tr>
                    {isAdmin && <th>Member</th>}

                    <th>Payment Notice</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Date</th>

                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      {isAdmin && (
                        <td>
                          <strong>
                            {payment.member?.name ||
                              "Unknown"}
                          </strong>
                        </td>
                      )}

                      <td>
                        {payment.paymentNotice?.title ||
                          "Unknown"}
                      </td>

                      <td>
                        <strong className="amount-highlight">
                          ₹
                          {Number(
                            payment.amount
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <span className="method-badge">
                          {payment.paymentMethod.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <span className="transaction-id">
                          {payment.transactionId || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`payment-status ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {formatStatus(
                            payment.status
                          )}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          payment.paymentDate
                        ).toLocaleDateString()}
                      </td>

                      {isAdmin && (
                        <td>
                          {(payment.status ===
                            "pending_verification" ||
                            payment.status ===
                              "pending") && (
                            <div className="payment-action-buttons">
                              <button
                                type="button"
                                className="verify-btn"
                                onClick={() =>
                                  verifyPayment(
                                    payment._id,
                                    "successful"
                                  )
                                }
                              >
                                Verify
                              </button>

                              <button
                                type="button"
                                className="reject-btn"
                                onClick={() =>
                                  verifyPayment(
                                    payment._id,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Payments;
import { useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";

import "./MessSettings.css";

function MessSettings() {
  const { user } = useAuth();

  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact: "",
    upiId: "",
    qrCode: "",
  });

  useEffect(() => {
    const loadMess = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/mess/me");

        const messData = response.data.mess;

        setMess(messData);

        setFormData({
          name: messData?.name || "",
          address: messData?.address || "",
          contact: messData?.contact || "",
          upiId: messData?.paymentSettings?.upiId || "",
          qrCode: messData?.paymentSettings?.qrCode || "",
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load mess information"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMess();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const response = await api.put(
        "/mess/me",
        formData
      );

      setMess(response.data.mess);

      setMessage(response.data.message);

      setTimeout(() => {
        setMessage("");
      }, 3500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update mess information"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="mess-settings-page">
      <div className="mess-settings-container">

        {/* Page Header */}
        <div className="mess-settings-header">
          <div className="mess-settings-title-area">
            <div className="mess-settings-title-icon">
              ⚙️
            </div>

            <div>
              <h1>Mess Settings</h1>

              <p>
                Manage your mess information and payment details.
              </p>
            </div>
          </div>

          <div className="mess-settings-role-badge">
            <span className="role-dot"></span>
            {user?.role === "admin" ? "Administrator" : "Member"}
          </div>
        </div>

        {/* Mess Information */}
        <div className="mess-settings-card">
          <div className="settings-card-header">
            <div className="settings-section-icon">
              🏠
            </div>

            <div>
              <h2>Mess Information</h2>
              <p>
                Basic information about your mess.
              </p>
            </div>
          </div>

          <div className="mess-meta-row">
            <div className="mess-meta-item">
              <span className="meta-label">
                Mess ID
              </span>

              <span className="meta-value mess-id-value">
                {mess?.messId || "-"}
              </span>
            </div>

            <div className="mess-meta-item">
              <span className="meta-label">
                Logged in as
              </span>

              <span className="meta-value">
                {user?.role || "-"}
              </span>
            </div>
          </div>

          <div className="settings-divider"></div>

          <form onSubmit={handleSubmit}>

            <div className="settings-form-grid">

              {/* Mess Name */}
              <div className="settings-field settings-field-full">
                <label htmlFor="mess-name">
                  Mess Name
                </label>

                <input
                  id="mess-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter mess name"
                />
              </div>

              {/* Address */}
              <div className="settings-field settings-field-full">
                <label htmlFor="mess-address">
                  Address
                </label>

                <input
                  id="mess-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter mess address"
                />
              </div>

              {/* Contact */}
              <div className="settings-field">
                <label htmlFor="mess-contact">
                  Contact Number
                </label>

                <input
                  id="mess-contact"
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </div>

            </div>

            {/* Payment Settings */}
            <div className="settings-section payment-section">

              <div className="settings-card-header">
                <div className="settings-section-icon payment-icon">
                  💳
                </div>

                <div>
                  <h2>Payment Settings</h2>

                  <p>
                    Configure the UPI details members will use for payments.
                  </p>
                </div>
              </div>

              <div className="payment-admin-note">
                <span>ℹ️</span>

                <p>
                  Only mess administrators can change payment settings.
                </p>
              </div>

              <div className="settings-form-grid">

                {/* UPI ID */}
                <div className="settings-field">
                  <label htmlFor="mess-upi">
                    UPI ID
                  </label>

                  <input
                    id="mess-upi"
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="example@upi"
                    disabled={user?.role !== "admin"}
                  />

                  <small>
                    Example: messname@upi
                  </small>
                </div>

                {/* QR Code URL */}
                <div className="settings-field">
                  <label htmlFor="mess-qr">
                    QR Code Image URL
                  </label>

                  <input
                    id="mess-qr"
                    type="text"
                    name="qrCode"
                    value={formData.qrCode}
                    onChange={handleChange}
                    placeholder="Paste QR code image URL"
                    disabled={user?.role !== "admin"}
                  />

                  <small>
                    Use a publicly accessible image URL.
                  </small>
                </div>

              </div>

              {/* QR Preview */}
              {formData.qrCode && (
                <div className="qr-preview-section">

                  <div className="qr-preview-heading">
                    <h3>QR Code Preview</h3>

                    <span>UPI Payment</span>
                  </div>

                  <div className="qr-preview-card">
                    <div className="qr-image-wrapper">
                      <img
                        src={formData.qrCode}
                        alt="Mess UPI QR Code"
                      />
                    </div>

                    <div className="qr-preview-info">
                      <h4>Scan to Pay</h4>

                      <p>
                        Members can scan this QR code to make their
                        mess payment.
                      </p>

                      {formData.upiId && (
                        <div className="preview-upi">
                          <span>UPI ID</span>
                          <strong>{formData.upiId}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Messages */}
            {message && (
              <div className="settings-success">
                <span className="success-icon">✓</span>

                <div>
                  <strong>Saved successfully</strong>
                  <p>{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="settings-error">
                <span className="error-icon">!</span>

                <div>
                  <strong>Unable to save changes</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Save */}
            <div className="settings-actions">
              <button
                type="submit"
                className="save-settings-btn"
                disabled={
                  updating || user?.role !== "admin"
                }
              >
                {updating ? (
                  <>
                    <span className="button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    ✓ Save Mess Information
                  </>
                )}
              </button>

              {user?.role !== "admin" && (
                <span className="admin-only-text">
                  Only administrators can save mess settings.
                </span>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default MessSettings;
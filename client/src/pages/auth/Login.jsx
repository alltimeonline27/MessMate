import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    if (message) {
      setMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setMessage("");

    try {
      // Keeps the premium loading animation visible briefly
      // even when the API responds very quickly.
      const [response] = await Promise.all([
        api.post("/auth/login", formData),

        new Promise((resolve) => {
          setTimeout(resolve, 550);
        }),
      ]);

      login(
        response.data.user,
        response.data.token,
        response.data.mess
      );

      setMessage(response.data.message);

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* =========================
            HEADER
        ========================== */}

        <div className="login-header">
          <div className="login-logo">
            <span>M</span>
            <span className="login-logo-orbit" />
          </div>

          <h1>Welcome Back</h1>

          <p>
            Login to manage your MessMate account
          </p>
        </div>

        {/* =========================
            LOGIN FORM
        ========================== */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="login-field">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          {/* =========================
              LOGIN BUTTON
          ========================== */}

          <button
            className={`login-button ${
              isLoading ? "login-button-loading" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="login-loading-content">
                <span className="login-loader">
                  <span className="loader-orbit" />
                  <span className="loader-core" />
                </span>

                <span className="login-loading-text">
                  Signing in
                  <span className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </span>
              </span>
            ) : (
              <span className="login-normal-content">
                Login
                <span className="login-arrow">→</span>
              </span>
            )}
          </button>
        </form>

        {/* =========================
            MESSAGE
        ========================== */}

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        {/* =========================
            REGISTER
        ========================== */}

        <div className="login-register">
          <p>New to MessMate?</p>

          <button
            className="register-button"
            type="button"
            onClick={() => navigate("/register")}
            disabled={isLoading}
          >
            Create a Mess / Register
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
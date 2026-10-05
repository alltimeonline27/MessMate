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

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/login", formData);

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
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">M</div>

          <h1>Welcome Back</h1>

          <p>
            Login to manage your MessMate account
          </p>
        </div>

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
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <div className="login-register">
          <p>New to MessMate?</p>

          <button
            className="register-button"
            type="button"
            onClick={() => navigate("/register")}
          >
            Create a Mess / Register
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
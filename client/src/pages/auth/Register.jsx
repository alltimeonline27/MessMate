import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    messName: "",
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
      const response = await api.post(
        "/auth/register",
        formData
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <div className="register-logo">M</div>

          <h1>Create Your Mess</h1>

          <p>
            Register your MessMate account and start
            managing your mess
          </p>
        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <div className="register-field">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field">
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

          <div className="register-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="messName">
              Mess Name
            </label>

            <input
              id="messName"
              type="text"
              name="messName"
              placeholder="Enter your mess name"
              value={formData.messName}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="register-submit"
            type="submit"
          >
            Create Mess & Register
          </button>
        </form>

        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        <div className="register-login">
          <p>Already have an account?</p>

          <button
            className="login-link-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            Login to MessMate
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;
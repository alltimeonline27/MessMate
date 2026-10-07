import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  /*
   * No token → login
   */
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  /*
   * Token exists → show premium loading
   * before opening protected page.
   */
  if (isChecking) {
    return (
      <div className="route-loading-screen">
        <div className="route-loader-card">

          <div className="route-loader-logo">
            <span>M</span>
            <span className="route-loader-orbit" />
          </div>

          <div className="route-loader-spinner">
            <span className="route-spinner-ring" />
            <span className="route-spinner-core" />
          </div>

          <h2>MessMate</h2>

          <p>
            Loading your mess
            <span className="route-loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>

        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
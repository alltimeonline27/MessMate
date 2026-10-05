/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useEffect,
  useState,
} from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const savedMess = localStorage.getItem("mess");

    if (!savedUser) {
      return null;
    }

    const parsedUser = JSON.parse(savedUser);
    const parsedMess = savedMess
      ? JSON.parse(savedMess)
      : null;

    return {
      ...parsedUser,
      mess: parsedMess,
    };
  });

  const login = (userData, token, messData) => {
    localStorage.setItem("token", token);

    localStorage.setItem(
      "role",
      userData.role
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    if (messData) {
      localStorage.setItem(
        "mess",
        JSON.stringify(messData)
      );
    }

    setUser({
      ...userData,
      mess: messData || null,
    });
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );

      const data = await response.json();

      if (!response.ok || !data.user) {
        return;
      }

      const currentUser = data.user;

      const savedMess =
        localStorage.getItem("mess");

      const parsedMess = savedMess
        ? JSON.parse(savedMess)
        : null;

      const updatedUser = {
        ...currentUser,
        mess: parsedMess,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );

      localStorage.setItem(
        "role",
        currentUser.role
      );

      setUser(updatedUser);
    } catch (error) {
      console.error(
        "Failed to refresh user:",
        error
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const timer = setTimeout(() => {
      refreshUser();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("mess");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
import { useState } from "react";

export function useAuth() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username, password, role) => {
    const basicAuth = { username, password, role };
    setAuth(basicAuth);
    localStorage.setItem("auth", JSON.stringify(basicAuth));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  return { auth, login, logout };
}

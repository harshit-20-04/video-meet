import { createContext, useState, useCallback } from "react";
import axios from 'axios';
import httpStatus from "http-status";

export const AuthContext = createContext({});

const url = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: `${url}/api/v1/user`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    return token ? { token, username } : null;
  });

  const handleRegister = useCallback(async (name, userName, email, password) => {
    const req = await client.post("/register", {
      name,
      username: userName,
      email,
      password
    });
    if (req.status === httpStatus.CREATED) {
      return req.data?.message || "User registered successfully!";
    }
    return "Registration complete";
  }, []);

  const handleLogin = useCallback(async (username, password) => {
    const req = await client.post("/login", {
      username,
      password,
    });
    if (req.status === httpStatus.OK) {
      const token = req.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      setUserData({ token, username });
      return req.data?.message || "Login successful!";
    }
    return "Login complete";
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUserData(null);
  }, []);

  const getHistoryOfUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const request = await client.get("/get_all_activity", {
      params: { token }
    });
    return request.data || [];
  }, []);

  const addUserHistory = useCallback(async (meetingCode) => {
    const token = localStorage.getItem("token");
    if (!token || !meetingCode) return null;
    const request = await client.post("/add_to_activity", {
      token,
      meetingId: meetingCode,
    });
    return request.data;
  }, []);

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    handleLogout,
    getHistoryOfUser,
    addUserHistory,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};

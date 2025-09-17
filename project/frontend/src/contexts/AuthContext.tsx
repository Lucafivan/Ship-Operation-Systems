import { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Cek token & fetch user saat app pertama kali load
  /*useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
      axios
        .get("http://localhost:5000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  */

  const login = (accessToken: string, refreshToken: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    // biasanya setelah login kita fetch user juga
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  // Fungsi untuk refresh access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;
    try {
      const res = await axios.post("/auth/refresh", null, {
        baseURL: "http://localhost:5000",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      localStorage.setItem("access_token", res.data.access_token);
      setIsAuthenticated(true);
      return res.data.access_token;
    } catch (err) {
      logout();
      return false;
    }
  };

  // Axios interceptor untuk auto-refresh token jika expired
  useEffect(() => {
    const api = axios;
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Cek token saat app load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        if (Date.now() >= exp * 1000) {
          // expired, coba refresh
          refreshAccessToken();
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
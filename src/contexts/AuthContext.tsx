import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { authApi } from "@/api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ----------------------------------
     INITIAL AUTH CHECK
  -----------------------------------*/
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Auth init failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      // 🔥 THIS WAS MISSING (CRITICAL)
      setIsLoading(false);
    }
  }, []);

  /* ----------------------------------
     LOGIN
  -----------------------------------*/
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      }

      return {
        success: false,
        message: response.message || response.error || "Login failed",
      };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed. Please try again.";
      return { success: false, message };
    }
  };

  /* ----------------------------------
     REGISTER
  -----------------------------------*/
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password);

      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return { success: true };
      }

      return {
        success: false,
        message: response.message || response.error || "Registration failed",
      };
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      return { success: false, message };
    }
  };

  /* ----------------------------------
     LOGOUT
  -----------------------------------*/
  const logout = () => {
    authApi.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
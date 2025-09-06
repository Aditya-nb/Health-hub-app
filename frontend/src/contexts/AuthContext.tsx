import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthUser, LoginRequest, RegisterRequest } from "../lib/api";
import api from "../lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    credentials: LoginRequest
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterRequest
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = api.getToken();
      if (token) {
        const response = await api.auth.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        } else {
          // Token is invalid, clear it
          api.setToken(null);
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    credentials: LoginRequest
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.auth.login(credentials);

      if (response.data) {
        api.setToken(response.data.access_token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    data: RegisterRequest
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.auth.register(data);

      if (response.data) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || "Registration failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      api.setToken(null);
      setUser(null);
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await api.auth.getCurrentUser();
      if (response.data) {
        setUser(response.data);
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      await logout();
    }
  };

  // Auto-refresh token periodically
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        api.auth.refreshToken().catch(() => {
          // If refresh fails, logout user
          logout();
        });
      }, 20 * 60 * 1000); // Refresh every 20 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

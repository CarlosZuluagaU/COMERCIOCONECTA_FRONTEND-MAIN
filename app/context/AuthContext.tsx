"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

interface GoogleUser { email: string; name: string; picture?: string; sub: string; }

interface AuthContextType {
  user: string | null;
  token: string | null;
  googleUser: GoogleUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleIdToken: string) => Promise<{ isNew: boolean }>;
  logout: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) throw new Error("La variable NEXT_PUBLIC_API_BASE_URL no está definida");

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    const st = localStorage.getItem("token");
    const su = localStorage.getItem("user");
    const sg = localStorage.getItem("googleUser");
    if (st) setToken(st);
    if (su) setUser(su);
    if (sg) { try { setGoogleUser(JSON.parse(sg)); } catch { /**/ } }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    const { accessToken, refreshToken } = res.data;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", email);
    setToken(accessToken); setUser(email);
  };

  const loginWithGoogle = async (googleIdToken: string): Promise<{ isNew: boolean }> => {
    let payload = parseJwt(googleIdToken);
    if (!payload) {
      // Es un access_token (botón personalizado) — obtener info del usuario
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${googleIdToken}` },
      });
      payload = await res.json();
    }
    if (!payload) throw new Error("Token de Google invalido");
    const gUser: GoogleUser = { email: payload.email, name: payload.name, picture: payload.picture, sub: payload.sub };
    localStorage.setItem("googleUser", JSON.stringify(gUser));
    setGoogleUser(gUser);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email: gUser.email, password: `google_${gUser.sub}` });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", gUser.email);
      setToken(accessToken); setUser(gUser.email);
      return { isNew: false };
    } catch {
      return { isNew: true };
    }
  };

  const logout = () => {
    ["token","refreshToken","user","googleUser"].forEach(k => localStorage.removeItem(k));
    setToken(null); setUser(null); setGoogleUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, googleUser, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

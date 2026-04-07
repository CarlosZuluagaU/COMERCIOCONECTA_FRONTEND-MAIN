"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

interface GoogleUser { email: string; name: string; picture?: string; sub: string; }

interface AuthContextType {
  user: string | null;
  token: string | null;
  googleUser: GoogleUser | null;
  comercioId: number | null;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleIdToken: string) => Promise<{ isNew: boolean }>;
  logout: () => void;
  updateUser: (nombre: string, newToken?: string, newRefreshToken?: string) => void;
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
  const [comercioId, setComercioId] = useState<number | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const st = localStorage.getItem("token");
    const su = localStorage.getItem("user");
    const sg = localStorage.getItem("googleUser");
    const sc = localStorage.getItem("comercioId");
    if (st) setToken(st);
    if (su) setUser(su);
    if (sg) { try { setGoogleUser(JSON.parse(sg)); } catch { /**/ } }
    if (sc) {
      setComercioId(Number(sc));
      setAuthLoaded(true);
    } else if (st) {
      // Tiene token pero no comercioId (ej: registro viejo) — recuperarlo del backend
      fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${st}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.comercioId) {
            const cid = Number(data.comercioId);
            localStorage.setItem("comercioId", String(cid));
            setComercioId(cid);
          }
        })
        .catch(() => {})
        .finally(() => setAuthLoaded(true));
    } else {
      setAuthLoaded(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    const { accessToken, refreshToken, comercioId: cid, nombre } = res.data;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", nombre || email);
    if (cid != null) localStorage.setItem("comercioId", String(cid));
    setToken(accessToken); setUser(nombre || email);
    if (cid != null) setComercioId(cid);
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
      const { accessToken, refreshToken, nombre, comercioId: cid } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // nombre from backend already has apellido concatenated in the register response
      const displayName = nombre && nombre !== gUser.email ? nombre : gUser.name || gUser.email;
      localStorage.setItem("user", displayName);
      if (cid != null) localStorage.setItem("comercioId", String(cid));
      setToken(accessToken); setUser(displayName);
      if (cid != null) setComercioId(cid);
      return { isNew: false };
    } catch {
      return { isNew: true };
    }
  };

  const logout = () => {
    ["token","refreshToken","user","googleUser","comercioId","storeConfig"].forEach(k => localStorage.removeItem(k));
    setToken(null); setUser(null); setGoogleUser(null); setComercioId(null);
  };

  const updateUser = (nombre: string, newToken?: string, newRefreshToken?: string) => {
    localStorage.setItem("user", nombre);
    setUser(nombre);
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, googleUser, comercioId, authLoaded, login, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import "./login.css";

const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setLoading(true);
      try {
        const { isNew } = await loginWithGoogle(tokenResponse.access_token);
        window.location.href = isNew ? "/register/complete-profile" : "/dashboard";
      } catch {
        setError("Error al iniciar sesión con Google");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Error al conectar con Google"),
  });

  return (
    <div className="auth-page">
      <div className="auth-card">

        <a href="/" className="auth-brand">
          <div className="auth-brand-icon">🛍</div>
          <div className="auth-brand-name">Comercios<span>Conecta</span></div>
        </a>

        <div className="auth-title">Bienvenido de vuelta</div>
        <div className="auth-sub">Ingresa a tu panel de gestión</div>

        {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}

        <button className="btn-google" onClick={() => googleLogin()} type="button">
          <GoogleIcon />
          Continuar con Google
        </button>

        <div className="auth-divider"><span>o ingresa con tu correo</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="fg">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              placeholder="tu@comercio.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fg">
            <label>Contraseña</label>
            <div className="input-wrap">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPw ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <a href="#" className="forgot">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="auth-bottom">
          ¿No tienes cuenta? <a href="/register">Regístrate gratis</a>
        </p>
      </div>
    </div>
  );
}

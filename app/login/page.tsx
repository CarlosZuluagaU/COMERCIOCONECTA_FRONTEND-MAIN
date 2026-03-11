"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./login.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-left">
          <h1 className="brand-title">Comercios<strong>Conecta</strong></h1>
          <p className="no-account-text"><strong>¿Aún no tienes cuenta?</strong></p>
          <a href="/register" className="register-button">Registrarse</a>
        </div>

        <div className="login-right">
          <h2 className="login-title">Iniciar sesión</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label>Correo</label>
            <input
              type="email"
              value={email}
              placeholder="ejemplo@correo.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { apiFetch } from "../../../component/utils/ApiFetch";
import "../Account.css";

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function FindPw() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const emailOk = useMemo(() => {
    const v = String(email || "").trim();
    if (!v) return false;
    if (v.length > 254) return false;
    return emailRegex.test(v);
  }, [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!emailOk) {
      setError("Enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to send reset email.");
      }

      setStatus("If an account exists for that email, we sent a password reset link. Please check your inbox and spam.");
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />

      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Forgot password?</h1>

          <div className="account-subtitle">
            Enter the email for your account and we’ll send you a reset link.
          </div>

          {status && (
            <div className="account-success" role="status">
              {status}
            </div>
          )}

          {error && (
            <div className="account-error" role="alert">
              {error}
            </div>
          )}

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-label">
              Email
              <input
                ref={inputRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="account-input"
                placeholder="Email Address"
                maxLength={254}
                readOnly={!!status}
              />
              <div className="account-help-small">
                You may need to check spam/junk. Some providers delay new senders by a few minutes.
              </div>
            </label>

            <button type="submit" className="account-btn" disabled={sending || !emailOk}>
              {sending ? "Sending…" : "Send reset link"}
            </button>

            <div className="account-signup-findpw" style={{ justifyContent: "center" }}>
              <p className="account-help">
                <Link to="/account">Back to Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </section>
  );
}
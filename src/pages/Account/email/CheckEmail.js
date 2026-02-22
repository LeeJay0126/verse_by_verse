import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { apiFetch } from "../../../component/utils/ApiFetch";
import "../Account.css";

export default function CheckEmail() {
  const location = useLocation();
  const emailFromState = location.state?.email || "";
  const sentFromState = location.state?.sent;

  const email = emailFromState;
  const [status, setStatus] = useState(
    sentFromState === false ? "Email failed to send. Please resend." : ""
  );
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
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  }, [email]);

  async function handleResend() {
    setError("");
    setStatus("");

    if (!emailOk) {
      setError("Enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      const res = await apiFetch(`/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to resend.");
      }

      setStatus("Verification email sent. Please check your inbox.");
    } catch (e) {
      setError(e?.message || "Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Check your email</h1>

          <div className="account-subtitle">
            We sent a verification link to your email. Open it to verify your account.
          </div>

          <div className="account-info" role="note">
            If you don’t see it, check spam/junk. <br/>
            Some providers delay new senders by a few minutes.
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

          <div className="account-form">
            <label className="account-label">
              Email
              <input
                type="email"
                value={email}
                readOnly
                className="account-input"
                maxLength={254}
              />
              <div className="account-help-small">Didn’t get it? Resend below.</div>
            </label>

            <button
              type="button"
              className="account-btn"
              onClick={handleResend}
              disabled={sending || !emailOk}
            >
              {sending ? "Sending…" : "Resend verification email"}
            </button>

            <div className="account-signup-findpw" style={{ justifyContent: "center" }}>
              <p className="account-help">
                <Link to="/account" state={{ email: email.trim() }}>
                  Back to Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
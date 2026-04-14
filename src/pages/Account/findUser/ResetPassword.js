import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { buildMobileResetUrl } from "../../../component/utils/mobileDeepLinks";
import "../Account.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = useMemo(() => (params.get("email") || "").trim(), [params]);
  const token = useMemo(() => (params.get("token") || "").trim(), [params]);
  const mobileResetUrl = useMemo(() => buildMobileResetUrl({ email, token }), [email, token]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pwOk = useMemo(() => {
    const pw = String(newPassword || "");
    if (!pw) return false;
    if (pw.length < 10) return false;
    if (pw.length > 72) return false;
    return true;
  }, [newPassword]);

  const matchOk = useMemo(() => {
    return newPassword && confirm && newPassword === confirm;
  }, [newPassword, confirm]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!email || !token) {
      setError("Missing reset link parameters.");
      return;
    }
    if (!pwOk) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (!matchOk) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          token,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Reset failed.");
      }

      setStatus("Password updated successfully!");
      setTimeout(() => {
        navigate("/account", { replace: true, state: { pwReset: true, email } });
      }, 800);
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Reset Password</h1>

          {!email || !token ? (
            <>
              <div className="account-error" role="alert">
                Missing reset link parameters.
              </div>
              <div className="account-signup-findpw" style={{ justifyContent: "center" }}>
                <p className="account-help">
                  <Link to="/findpw">Request a new reset link</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="account-subtitle">
                Choose a new password for <b>{email}</b>.
              </div>

              <div className="account-info" role="note">
                If you opened this link on a phone, you can continue here on the web or jump into
                the mobile app.
              </div>

              <a className="account-btn account-btn--secondary" href={mobileResetUrl}>
                Open in mobile app
              </a>

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
                  New Password
                  <input
                    ref={inputRef}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="account-input"
                    placeholder="New password (min 10 chars)"
                    maxLength={72}
                    autoComplete="new-password"
                  />
                </label>

                <label className="account-label">
                  Confirm Password
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="account-input"
                    placeholder="Confirm new password"
                    maxLength={72}
                    autoComplete="new-password"
                  />
                </label>

                <button type="submit" className="account-btn" disabled={saving || !pwOk || !matchOk}>
                  {saving ? "Saving…" : "Update password"}
                </button>

                <div className="account-signup-findpw" style={{ justifyContent: "center" }}>
                  <p className="account-help">
                    <Link to="/account" state={{ email }}>
                      Back to Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </section>
  );
}

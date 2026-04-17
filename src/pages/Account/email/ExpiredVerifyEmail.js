import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { apiFetch } from "../../../component/utils/ApiFetch";
import {
  RESEND_COOLDOWN_MS,
  VERIFICATION_LINK_TTL_MINUTES,
  clearCooldownUntil,
  formatCooldown,
  getRemainingSeconds,
  readCooldownUntil,
  writeCooldownUntil,
} from "./resendCooldown";
import "../Account.css";

export default function ExpiredVerifyEmail() {
  const location = useLocation();
  const emailFromState = typeof location.state?.email === "string" ? location.state.email : "";
  const initialError =
    typeof location.state?.error === "string" && location.state.error.trim()
      ? location.state.error.trim()
      : "This verification link is invalid or expired. Request a new one.";

  const email = useMemo(() => emailFromState.trim(), [emailFromState]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(initialError);
  const [sending, setSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(() => readCooldownUntil(emailFromState));

  const emailOk = useMemo(() => {
    if (!email) return false;
    if (email.length > 254) return false;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }, [email]);

  const remainingSeconds = useMemo(() => getRemainingSeconds(cooldownUntil), [cooldownUntil]);

  useEffect(() => {
    const existing = readCooldownUntil(email);
    if (existing > Date.now()) {
      setCooldownUntil(existing);
      return;
    }

    clearCooldownUntil(email);
    setCooldownUntil(0);
  }, [email]);

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    if (cooldownUntil <= Date.now()) {
      clearCooldownUntil(email);
      setCooldownUntil(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (cooldownUntil <= Date.now()) {
        clearCooldownUntil(email);
        setCooldownUntil(0);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [cooldownUntil, email]);

  const resendDisabled = sending || !emailOk || remainingSeconds > 0;

  async function handleResend() {
    setStatus("");
    setError("");

    if (!emailOk) {
      setError("We could not determine a valid email to resend to. Please sign in again.");
      return;
    }

    setSending(true);
    try {
      const res = await apiFetch("/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        const nextError = new Error(data?.error || "Failed to resend verification email.");
        nextError.code = data?.code;
        nextError.status = res.status;
        throw nextError;
      }

      const nextCooldownUntil = Date.now() + RESEND_COOLDOWN_MS;
      writeCooldownUntil(email, nextCooldownUntil);
      setCooldownUntil(nextCooldownUntil);
      setStatus(
        `A new verification email has been sent. Verification links expire in ${VERIFICATION_LINK_TTL_MINUTES} minutes.`
      );
    } catch (e) {
      if (e?.code === "TOO_SOON" || e?.status === 429) {
        const existing = readCooldownUntil(email);
        const nextCooldownUntil = existing > Date.now() ? existing : Date.now() + RESEND_COOLDOWN_MS;
        writeCooldownUntil(email, nextCooldownUntil);
        setCooldownUntil(nextCooldownUntil);
        setError(
          `Please wait before resending the verification email${getRemainingSeconds(nextCooldownUntil) > 0 ? ` (${formatCooldown(getRemainingSeconds(nextCooldownUntil))})` : ""}.`
        );
      } else {
        setError(e?.message || "Failed to resend verification email.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Verify Email</h1>

          {status ? (
            <div className="account-success" role="status">
              {status}
            </div>
          ) : null}

          {error ? (
            <div className="account-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="account-info" role="note">
            This can happen if the verification link is old or has already been replaced by a newer
            one. Verification links expire in {VERIFICATION_LINK_TTL_MINUTES} minutes.
          </div>

          {email ? (
            <label className="account-label">
              Email
              <input type="email" value={email} readOnly className="account-input" maxLength={254} />
            </label>
          ) : null}

          <div className="account-action-stack">
            <button
              type="button"
              className="account-btn"
              onClick={handleResend}
              disabled={resendDisabled}
            >
              {sending
                ? "Sending..."
                : remainingSeconds > 0
                  ? `Resend available in ${formatCooldown(remainingSeconds)}`
                  : "Resend verification email"}
            </button>

            <Link className="account-btn account-btn--secondary" to="/account" state={{ email }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { buildMobileAppHomeUrl } from "../../../component/utils/mobileDeepLinks";
import "../Account.css";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = useMemo(() => (params.get("email") || "").trim(), [params]);
  const token = useMemo(() => (params.get("token") || "").trim(), [params]);
  const mobileAppUrl = useMemo(() => buildMobileAppHomeUrl(), []);

  const [status, setStatus] = useState("Verifying...");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setError("");
      setDone(false);

      if (!email || !token) {
        setStatus("");
        setError("Missing verification link parameters.");
        return;
      }

      try {
        const qs = `?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
        const res = await apiFetch(`/auth/verify-email${qs}`, { method: "GET" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data?.ok === false) {
          const nextError = new Error(data?.error || "Verification failed.");
          nextError.code = data?.code;
          nextError.status = res.status;
          throw nextError;
        }

        if (!mounted) return;

        setStatus(
          data?.alreadyVerified
            ? "Your email was already verified."
            : "Your email has been verified."
        );
        setDone(true);

        setTimeout(() => {
          navigate("/account", { replace: true, state: { verified: true, email } });
        }, 800);
      } catch (e) {
        if (!mounted) return;
        const code = String(e?.code || "").toUpperCase();
        const isInvalidOrExpired = e?.status === 400 && code === "INVALID_OR_EXPIRED";

        if (isInvalidOrExpired) {
          navigate("/verify-email-expired", {
            replace: true,
            state: {
              email,
              error: "This verification link is invalid or expired. Request a new one.",
            },
          });
          return;
        }

        setStatus("");
        setError(e?.message || "Verification failed.");
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [email, token, navigate]);

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

          {done ? (
            <div className="account-info" role="note">
              Verified on the web. If you want to continue on your phone, open the mobile app and
              sign in there.
            </div>
          ) : null}

          {done ? (
            <a className="account-btn account-btn--secondary" href={mobileAppUrl}>
              Open mobile app
            </a>
          ) : null}

          <div className="account-signup-findpw" style={{ justifyContent: "center" }}>
            {done ? (
              <p className="account-help">
                <Link to="/account" state={{ verified: true, email }}>
                  Go to Sign In
                </Link>
              </p>
            ) : (
              <p className="account-help">
                <Link to="/check-email" state={{ email }}>
                  Resend verification email
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

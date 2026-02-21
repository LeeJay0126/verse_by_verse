import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { apiFetch } from "../../../component/utils/ApiFetch";
import "../Account.css";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = useMemo(() => (params.get("email") || "").trim(), [params]);
  const token = useMemo(() => (params.get("token") || "").trim(), [params]);

  const [status, setStatus] = useState("Verifying…");
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
          throw new Error(data?.error || "Verification failed.");
        }

        if (!mounted) return;

        setStatus("Email verified successfully!");
        setDone(true);

        // Auto-redirect to sign in with a banner + prefilled email
        setTimeout(() => {
          navigate("/account", { replace: true, state: { verified: true, email } });
        }, 800);
      } catch (e) {
        if (!mounted) return;
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
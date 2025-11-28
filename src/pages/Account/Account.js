import "./Account.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../component/PageHeader";
import Footer from "../../component/Footer";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useAuth } from "../../component/context/AuthContext";

export default function Account() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const idRef = useRef(null);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const isValid = id.trim().length >= 3 && pw.length >= 4;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError("Please check your ID/PW.");
      return;
    }

    setSubmitting(true);

    try {
      await login(id, pw); // `id` can be email OR username
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Network Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Sign In</h1>

          {error && (
            <div className="account-error" role="alert">
              {error}
            </div>
          )}

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-label">
              Username / Email
              <input
                ref={idRef}
                type="text"
                autoComplete="username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="account-input"
                placeholder="Username or Email"
                aria-invalid={!!error && !isValid}
              />
            </label>

            <label className="account-label">
              Password
              <div className="password-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="account-input"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide Password" : "View Password"}
                >
                  {showPw ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="account-btn"
              disabled={submitting || !isValid}
            >
              {submitting ? "Logging in…" : "Log In"}
            </button>
          </form>

          <div className="account-signup-findpw">
            <p className="account-help">
              아직 계정이 없나요? <a href="/signup">회원가입</a>
            </p>
            <p className="account-help">
              <a href="/findpw">비밀번호를 잊었습니까?</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

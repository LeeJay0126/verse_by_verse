import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import "../Account.css";
import Footer from "../../../component/Footer";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { apiFetch } from "../../../component/utils/ApiFetch";
import zxcvbn from "zxcvbn";

const MAX_NAME_LEN = 20;
const MAX_USERNAME_LEN = 20;

const MIN_PW_LEN = 10;
const MAX_PW_LEN = 72;

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "1234567890",
  "12345678",
  "123456789",
  "qwerty",
  "qwerty123",
  "11111111",
  "00000000",
  "letmein",
  "admin",
  "iloveyou",
  "welcome",
]);

const normalizeSpaces = (s) => s.replace(/\s+/g, " ").trim();

const usernamePattern = /^[a-zA-Z0-9._]+$/;

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    username: false,
    email: false,
    pw: false,
    confirmPw: false,
  });

  const emailRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const usernameRef = useRef(null);
  const pwRef = useRef(null);
  const confirmPwRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const emailValue = useMemo(() => email.trim(), [email]);
  const usernameValue = useMemo(() => username.trim(), [username]);
  const firstNameValue = useMemo(() => normalizeSpaces(firstName), [firstName]);
  const lastNameValue = useMemo(() => normalizeSpaces(lastName), [lastName]);

  const emailOk = useMemo(() => {
    if (!emailValue) return false;
    if (emailValue.length > 254) return false;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailValue);
  }, [emailValue]);

  const nameOk = useMemo(() => {
    if (!firstNameValue || !lastNameValue) return false;
    if (firstNameValue.length > MAX_NAME_LEN) return false;
    if (lastNameValue.length > MAX_NAME_LEN) return false;
    return true;
  }, [firstNameValue, lastNameValue]);

  const usernameOk = useMemo(() => {
    if (!usernameValue) return false;
    if (usernameValue.length < 4) return false;
    if (usernameValue.length > MAX_USERNAME_LEN) return false;
    if (!usernamePattern.test(usernameValue)) return false;
    if (usernameValue.startsWith(".") || usernameValue.startsWith("_")) return false;
    if (usernameValue.endsWith(".") || usernameValue.endsWith("_")) return false;
    if (usernameValue.includes("..") || usernameValue.includes("__") || usernameValue.includes("._") || usernameValue.includes("_."))
      return false;
    return true;
  }, [usernameValue]);

  const userInputsForPw = useMemo(() => {
    const parts = [
      usernameValue,
      emailValue,
      firstNameValue,
      lastNameValue,
      ...(emailValue.includes("@") ? [emailValue.split("@")[0]] : []),
    ]
      .map((s) => (s || "").toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(parts));
  }, [usernameValue, emailValue, firstNameValue, lastNameValue]);

  const pwBasicOk = useMemo(() => {
    if (!pw) return false;
    if (pw.length < MIN_PW_LEN) return false;
    if (pw.length > MAX_PW_LEN) return false;
    if (COMMON_PASSWORDS.has(pw.toLowerCase())) return false;
    return true;
  }, [pw]);

  const pwZ = useMemo(() => {
    if (!pw) return null;
    return zxcvbn(pw, userInputsForPw);
  }, [pw, userInputsForPw]);

  const pwScore = pwZ?.score ?? 0; // 0-4
  const pwStrongEnough = pwBasicOk && pwScore >= 3;

  const matchOk = useMemo(() => {
    if (!confirmPw) return false;
    return pw === confirmPw;
  }, [pw, confirmPw]);

  const fieldErrors = useMemo(() => {
    const e = {};

    if (!firstNameValue) e.firstName = "First name is required.";
    else if (firstNameValue.length > MAX_NAME_LEN) e.firstName = `Max ${MAX_NAME_LEN} characters.`;

    if (!lastNameValue) e.lastName = "Last name is required.";
    else if (lastNameValue.length > MAX_NAME_LEN) e.lastName = `Max ${MAX_NAME_LEN} characters.`;

    if (!emailValue) e.email = "Email is required.";
    else if (!emailOk) e.email = "Enter a valid email address.";

    if (!usernameValue) e.username = "Username is required.";
    else if (usernameValue.length < 4) e.username = "Username must be at least 4 characters.";
    else if (usernameValue.length > MAX_USERNAME_LEN) e.username = `Max ${MAX_USERNAME_LEN} characters.`;
    else if (!usernamePattern.test(usernameValue)) e.username = "Only letters, numbers, dot, underscore.";
    else if (
      usernameValue.startsWith(".") ||
      usernameValue.startsWith("_") ||
      usernameValue.endsWith(".") ||
      usernameValue.endsWith("_")
    )
      e.username = "Cannot start/end with . or _";
    else if (
      usernameValue.includes("..") ||
      usernameValue.includes("__") ||
      usernameValue.includes("._") ||
      usernameValue.includes("_.")
    )
      e.username = "Avoid consecutive punctuation patterns.";

    if (!pw) e.pw = "Password is required.";
    else if (pw.length < MIN_PW_LEN) e.pw = `Use at least ${MIN_PW_LEN} characters.`;
    else if (pw.length > MAX_PW_LEN) e.pw = `Max ${MAX_PW_LEN} characters.`;
    else if (COMMON_PASSWORDS.has(pw.toLowerCase())) e.pw = "That password is too common.";
    else if (pwScore < 3) e.pw = "Password is too weak. Make it longer or less predictable.";

    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (!matchOk) e.confirmPw = "Passwords do not match.";

    return e;
  }, [firstNameValue, lastNameValue, emailValue, emailOk, usernameValue, pw, confirmPw, matchOk, pwScore]);

  const isValid = useMemo(() => {
    return (
      nameOk &&
      emailOk &&
      usernameOk &&
      pwStrongEnough &&
      matchOk &&
      Object.keys(fieldErrors).length === 0
    );
  }, [nameOk, emailOk, usernameOk, pwStrongEnough, matchOk, fieldErrors]);

  const pwMeter = useMemo(() => {
    const pct = pw ? ((pwScore + 1) / 5) * 100 : 0; // 20..100
    const label = !pw
      ? "Enter a password"
      : pwScore <= 1
        ? "Weak"
        : pwScore === 2
          ? "Fair"
          : pwScore === 3
            ? "Good"
            : "Strong";

    const guidance =
      !pw
        ? ""
        : pwZ?.feedback?.warning
          ? pwZ.feedback.warning
          : pwScore < 3
            ? "Try adding more words, mixing uncommon phrases, or making it longer."
            : "Looks good.";

    return { pct, label, guidance };
  }, [pw, pwScore, pwZ]);

  const markTouched = (key) => setTouched((t) => ({ ...t, [key]: true }));

  const focusFirstInvalid = () => {
    if (fieldErrors.firstName) return firstNameRef.current?.focus();
    if (fieldErrors.lastName) return lastNameRef.current?.focus();
    if (fieldErrors.email) return emailRef.current?.focus();
    if (fieldErrors.username) return usernameRef.current?.focus();
    if (fieldErrors.pw) return pwRef.current?.focus();
    if (fieldErrors.confirmPw) return confirmPwRef.current?.focus();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    setTouched({
      firstName: true,
      lastName: true,
      username: true,
      email: true,
      pw: true,
      confirmPw: true,
    });

    if (!isValid) {
      focusFirstInvalid();
      setError("Please check your information.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(`/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstNameValue,
          lastName: lastNameValue,
          email: emailValue,
          username: usernameValue,
          password: pw,
          passwordScore: pwScore, // optional: server can log/validate or ignore
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Sign up failed.");
      }

      navigate("/check-email", {
        replace: true,
        state: { email: emailValue, sent: data?.verification?.sent ?? true },
      });
    } catch (err) {
      setError(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  const showFieldError = (key) => touched[key] && fieldErrors[key];

  return (
    <section className="Account">
      <PageHeader />

      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Sign Up</h1>

          {error && (
            <div className="account-error" role="alert">
              {error}
            </div>
          )}

          <form className="account-form" onSubmit={handleSubmit} noValidate>
            <div className="signup-name-flex">
              <div>
                <input
                  ref={firstNameRef}
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => markTouched("firstName")}
                  className="account-input"
                  placeholder="First Name"
                  maxLength={MAX_NAME_LEN}
                  aria-invalid={!!showFieldError("firstName")}
                />
                {showFieldError("firstName") && (
                  <div className="account-field-error" role="alert">
                    {fieldErrors.firstName}
                  </div>
                )}
              </div>

              <div>
                <input
                  ref={lastNameRef}
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => markTouched("lastName")}
                  className="account-input"
                  placeholder="Last Name"
                  maxLength={MAX_NAME_LEN}
                  aria-invalid={!!showFieldError("lastName")}
                />
                {showFieldError("lastName") && (
                  <div className="account-field-error" role="alert">
                    {fieldErrors.lastName}
                  </div>
                )}
              </div>
            </div>

            <label className="account-label">
              Email
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                className="account-input"
                placeholder="Email Address"
                maxLength={254}
                aria-invalid={!!showFieldError("email")}
              />
              {showFieldError("email") && (
                <div className="account-field-error" role="alert">
                  {fieldErrors.email}
                </div>
              )}
            </label>

            <label className="account-label">
              Username
              <input
                ref={usernameRef}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => markTouched("username")}
                className="account-input"
                placeholder="Username"
                maxLength={MAX_USERNAME_LEN}
                aria-invalid={!!showFieldError("username")}
              />
              {showFieldError("username") && (
                <div className="account-field-error" role="alert">
                  {fieldErrors.username}
                </div>
              )}
              <div className="account-help-small">
                4–{MAX_USERNAME_LEN} chars. Letters, numbers, dot, underscore.
              </div>
            </label>

            <label className="account-label">
              Password
              <div className="password-wrap">
                <input
                  ref={pwRef}
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onBlur={() => markTouched("pw")}
                  className="account-input"
                  placeholder={`Password (${MIN_PW_LEN}-${MAX_PW_LEN} chars)`}
                  maxLength={MAX_PW_LEN}
                  aria-invalid={!!showFieldError("pw")}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide Password" : "Show Password"}
                >
                  {showPw ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>

              <div className="pw-meter">
                <div className="pw-meter-top">
                  <span className="pw-meter-label">Strength: {pwMeter.label}</span>
                  <span className="pw-meter-score">{pw ? `${pwScore}/4` : ""}</span>
                </div>
                <div className="pw-meter-bar" aria-hidden="true">
                  <div className="pw-meter-fill" style={{ width: `${pwMeter.pct}%` }} />
                </div>
                {pwMeter.guidance && <div className="account-help-small">{pwMeter.guidance}</div>}
              </div>

              {showFieldError("pw") && (
                <div className="account-field-error" role="alert">
                  {fieldErrors.pw}
                </div>
              )}
            </label>

            <label className="account-label">
              Confirm Password
              <input
                ref={confirmPwRef}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                onBlur={() => markTouched("confirmPw")}
                className="account-input"
                placeholder="Confirm Password"
                maxLength={MAX_PW_LEN}
                aria-invalid={!!showFieldError("confirmPw")}
              />
              {showFieldError("confirmPw") && (
                <div className="account-field-error" role="alert">
                  {fieldErrors.confirmPw}
                </div>
              )}
            </label>

            <button type="submit" className="account-btn" disabled={loading || !isValid}>
              {loading ? "Signing up…" : "Create Account"}
            </button>
          </form>

          <div className="account-signup-findpw">
            <p className="account-help">
              Already have an account? <a href="/account">Sign in</a>
            </p>
            <p className="account-help">
              <a href="/findpw">Forgot your password?</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SignUp;
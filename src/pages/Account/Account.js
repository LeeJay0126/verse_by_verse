import { useEffect, useRef, useState } from 'react';
import PageHeader from "../../component/PageHeader";
import './Account.css';
import Footer from '../../component/Footer';
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:4000';

export default function Account() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const idRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  const isValid = id.trim().length >= 3 && pw.length >= 4; // id password conditions

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isValid) return setError('Please check your ID/PW.');

    setLoading(true);
    try {
      // backend url to be added here
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: id, password: pw }), // have to match with backend field names
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || 'Failed to log in');
      }

      // succesful login situation
      console.log('Logged in:', data.user);
      navigate('/'); // Home redirect

    } catch (err) {
      setError(err.message || 'Network Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className='account-content'>
        <div className="account-card">
          <h1 className="account-title">Sign In</h1>

          {error && (
            <div className="account-error" role="alert">
              {error}
            </div>
          )}

          <form className="account-form" onSubmit={handleSubmit}>

            <label className="account-label">
              ID / Email
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
                  type={showPw ? 'text' : 'password'}
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
                  aria-label={showPw ? 'Hide Password' : 'View Password'}
                >
                  {showPw ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="account-btn"
              disabled={loading || !isValid}
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
          <div className='account-signup-findpw'>
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
};


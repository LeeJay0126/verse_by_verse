import { useEffect, useRef, useState } from 'react';
import Header from '../../component/Header';
import './Account.css';


const API_URL = 'http://localhost:4000';

export default function Account() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const idRef = useRef(null);

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  const isValid = id.trim().length >= 3 && pw.length >= 4; // id password conditions

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isValid) return setError('아이디/비밀번호 형식을 확인해주세요.');

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
        throw new Error(data?.error || '로그인 실패');
      }

      // succesful login situation
      console.log('Logged in:', data.user);

    } catch (err) {
      setError(err.message || '네트워크 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="Account">
      <Header />
      <div className="account-card">
        <h1 className="account-title">로그인</h1>

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
              placeholder="아이디 또는 이메일"
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
                placeholder="비밀번호"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="account-btn"
            disabled={loading || !isValid}
          >
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </form>

        <p className="account-help">
          아직 계정이 없나요? <a href="/signup">회원가입</a>
        </p>
      </div>
    </section>
  );
}

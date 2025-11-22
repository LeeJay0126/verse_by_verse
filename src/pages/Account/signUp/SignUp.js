import { useEffect, useRef, useState } from 'react';
import PageHeader from "../../../component/PageHeader";
import '../Account.css';
import Footer from '../../../component/Footer';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";

const API_URL = 'http://localhost:4000';

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const idRef = useRef(null);

    const emailOk  = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(id);
    const passOk   = pw.length >= 4; // need adjustment
    const matchOk  = pw === confirmPw;
    const nameOk   = firstName.trim().length > 0 && lastName.trim().length > 0;
    const isValid  = emailOk && passOk && matchOk && nameOk;  

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!isValid) {
          setError('입력값을 확인해주세요 (필수/이메일/비번/일치).');
          return;
        }
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName,
              lastName,
              email: id,
              password: pw
            })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data?.ok === false) {
            throw new Error(data?.error || '회원가입 실패');
          }
          console.log('[signup success]', data.user);
          // TODO: navigate('/') 또는 전역 상태 setUser(data.user) 등
        } catch (err) {
          console.error('[signup error]', err);
          setError(err.message || '네트워크 오류');
        } finally {
          setLoading(false);
        }
      }    

      return (
        <section className="Account">
          <PageHeader />
          <div className='account-content'>
            <div className="account-card">
              <h1 className="account-title">Sign Up</h1>
    
              {error && <div className="account-error" role="alert">{error}</div>}
    
              <form className="account-form" onSubmit={handleSubmit}>
                <div className='signup-name-flex'>
                  <div>
                    <input
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="account-input"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="account-input"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
    
                <label className="account-label">
                  ID / Email
                  <input
                    ref={idRef}
                    type="email"
                    autoComplete="username email"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="account-input"
                    placeholder="Username or Email"
                    aria-invalid={!emailOk}
                  />
                </label>
    
                <label className="account-label">
                  Password
                  <div className="password-wrap">
                    <input
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      className="account-input"
                      placeholder="Password (4+ chars)"
                      aria-invalid={!passOk}
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Hide Password' : 'Show Password'}
                    >
                      {showPw ? <FaRegEyeSlash /> : <FaRegEye />}
                    </button>
                  </div>
                </label>
    
                <label className="account-label">
                  Confirm Password
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="account-input"
                    placeholder="Confirm Password"
                    aria-invalid={!matchOk}
                  />
                </label>
    
                <button type="submit" className="account-btn" disabled={loading || !isValid}>
                  {loading ? 'Signing up…' : 'Create Account'}
                </button>
              </form>
    
              <div className='account-signup-findpw'>
                <p className="account-help">이미 계정이 있나요? <a href="/account">로그인</a></p>
                <p className="account-help"><a href="/findpw">비밀번호를 잊었습니까?</a></p>
              </div>
            </div>
          </div>
          <Footer />
        </section>
      );
    }

export default SignUp;
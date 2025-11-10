import { useEffect, useRef, useState } from 'react';
import PageHeader from "../../../component/PageHeader";
import '../Account.css';
import Footer from '../../../component/Footer';
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";

const API_URL = 'http://localhost:4000';

const SignUp = () => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const idRef = useRef(null);

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

                    <form className="account-form">
                        <div className='signup-name-flex'>
                            <div>
                                {/* <label className='account-label'>
                                    First Name
                                </label> */}
                                <input
                                    // ref={idRef}
                                    type="text"
                                    autoComplete="firstName"
                                    // value={id}
                                    onChange={(e) => setName(e.target.value)}
                                    className="account-input"
                                    placeholder="First Name"
                                />
                            </div>
                            <div>
                                {/* <label className='account-label'>
                                    Last Name
                                </label> */}
                                <input
                                    // ref={idRef}
                                    type="text"
                                    autoComplete="firstName"
                                    // value={id}
                                    onChange={(e) => setName(e.target.value)}
                                    className="account-input"
                                    placeholder="Last Name"
                                />
                            </div>

                        </div>
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
                            // aria-invalid={!!error && !isValid}
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
                        <label className="account-label">
                            Confirm Password
                            <div className="password-wrap">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    // autoComplete="current-password"
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    className="account-input"
                                    placeholder="Confirm Password"
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            className="account-btn"
                        // disabled={loading || !isValid}
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

export default SignUp;
import { useEffect, useRef, useState } from 'react';
import PageHeader from "../../../component/PageHeader";
import '../Account.css';
import Footer from '../../../component/Footer';
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";

const API_URL = 'http://localhost:4000';

const FindPw = () => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [id, setId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const idRef = useRef(null);

    return (
        <section className="Account">
            <PageHeader />
            <div className='account-content'>
                <div className="account-card">
                    <h1 className="account-title">Forgot Password?</h1>
                    <p className='findpw-desc'>
                        Enter your name and username to find your password
                    </p>

                    {error && (
                        <div className="account-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="account-form">
                        <div>
                            <label className='account-label'>
                                First Name
                            </label>
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
                            <label className='account-label'>
                                    Last Name
                                </label>
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
                    </div>
                </div>
            </div>
            <Footer />
        </section>
    );

};

export default FindPw;
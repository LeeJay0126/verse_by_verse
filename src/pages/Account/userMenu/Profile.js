// src/account/Profile.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { useAuth } from "../../../component/context/AuthContext";
import "../Account.css";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { apiFetch } from "../../../component/utils/ApiFetch";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");

    if (!currentPw || !newPw || !confirmPw) {
      setError("All inputs must be entered.");
      return;
    }
    if (newPw.length < 4) {
      setError("New Password needs to be 4+ letters");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Password don't match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(`/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "비밀번호 변경에 실패했습니다.");
      }

      // backend already destroyed session & cleared cookie; also clear client state
      await logout();
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message || "네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="Account">
      <PageHeader />
      <div className="account-content">
        <div className="account-card">
          <h1 className="account-title">Profile</h1>

          {!user ? (
            <p className="account-subtitle">
              You’re not logged in. Please sign in to view your profile.
            </p>
          ) : (
            <>
              <p className="account-subtitle">
                Manage your Verse by Verse account details.
              </p>

              {error && (
                <div className="account-error" role="alert">
                  {error}
                </div>
              )}

              <div className="profile-fields">
                <div className="profile-field">
                  <span className="profile-label">Name</span>
                  <span className="profile-value">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div className="profile-field">
                  <span className="profile-label">Username</span>
                  <span className="profile-value">{user.username}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-label">Email</span>
                  <span className="profile-value">{user.email}</span>
                </div>
                <div className="profile-field">
                  <span className="profile-label">Password</span>
                  <button
                    type="button"
                    className="profile-change-btn"
                    onClick={() => setShowChangePw((v) => !v)}
                  >
                    {showChangePw ? "Cancel" : "Change Password"}
                  </button>
                </div>
              </div>

              <div
                className={
                  "password-change-panel" +
                  (showChangePw ? " password-change-panel--open" : "")
                }
              >
                <form className="password-change-form" onSubmit={handleChangePassword}>
                  <label className="account-label">
                    Current Password
                    <div className="password-wrap">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        className="account-input"
                        autoComplete="current-password"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        placeholder="Current Password"
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        aria-label={
                          showCurrentPw ? "Hide current password" : "Show current password"
                        }
                      >
                        {showCurrentPw ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </label>

                  <label className="account-label">
                    New Password
                    <div className="password-wrap">
                      <input
                        type={showNewPw ? "text" : "password"}
                        className="account-input"
                        autoComplete="new-password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="New Password"
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowNewPw((v) => !v)}
                        aria-label={
                          showNewPw ? "Hide new password" : "Show new password"
                        }
                      >
                        {showNewPw ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </label>

                  <label className="account-label">
                    Confirm New Password
                    <div className="password-wrap">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        className="account-input"
                        autoComplete="new-password"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        placeholder="Confirm New Password"
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        aria-label={
                          showConfirmPw
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPw ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="account-btn password-change-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Changing..." : "Submit"}
                  </button>
                  <p className="password-change-help">
                    After changing your password, you’ll be asked to sign in again.
                  </p>
                </form>
              </div>

              <p className="profile-note">
                (Later we can add profile editing, avatar, and preferences here.)
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default Profile;

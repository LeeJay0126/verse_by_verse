import "react-native-gesture-handler";
import "./global.css";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts,
} from "@expo-google-fonts/playfair-display";
import {
  API_ENV_KEYS,
  SCRIPTURE_API_ENV_KEYS,
  DEFAULT_BIBLE_VERSION_ID,
  createApiClient,
  createAuthApi,
  createBibleApi,
  createCommunityApi,
  createNotesApi,
  formatRelativeTime,
  buildApiUrl,
  getApiBase,
} from "@verse/shared";
import SignInScreen from "./src/screens/SignInScreen";
import AppTabs from "./src/navigation/AppTabs";

const MAX_PASSWORD_LEN = 72;

export default function App() {
  const env = process.env;
  const apiBase = getApiBase(env);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const authApi = useMemo(() => {
    const client = createApiClient({
      env,
      fetchImpl: fetch,
    });

    return createAuthApi({ apiFetch: client.apiFetch });
  }, [env]);
  const bibleApi = useMemo(() => {
    const client = createApiClient({
      env,
      fetchImpl: fetch,
    });

    return createBibleApi({
      env,
      fetchImpl: fetch,
      apiFetch: client.apiFetch,
    });
  }, [env]);
  const notesApi = useMemo(() => {
    const client = createApiClient({
      env,
      fetchImpl: fetch,
    });

    return createNotesApi({ apiFetch: client.apiFetch });
  }, [env]);
  const communityApi = useMemo(() => {
    const client = createApiClient({
      env,
      fetchImpl: fetch,
    });

    return createCommunityApi({
      apiFetch: client.apiFetch,
      formatRelativeTime,
    });
  }, [env]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("signIn");
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [signUpForm, setSignUpForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [signUpStatus, setSignUpStatus] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const signUpSubmittingRef = React.useRef(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [resetForm, setResetForm] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetStatus, setResetStatus] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { user: currentUser } = await authApi.getCurrentUser();
        if (active) {
          setUser(currentUser);
          setError("");
        }
      } catch (err) {
        if (active) {
          setUser(null);
          setError("");
        }
      } finally {
        if (active) setInitializing(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authApi]);

  useEffect(() => {
    const applyResetUrl = (url) => {
      if (!url) return;

      try {
        const parsed = new URL(url);
        const routeValue = [parsed.host || "", parsed.pathname || ""].join("/");
        const normalizedRoute = routeValue.replace(/\/+/g, "/");

        if (!normalizedRoute.includes("reset-password")) return;

        const email = parsed.searchParams.get("email") || "";
        const token = parsed.searchParams.get("token") || "";

        if (!email || !token) return;

        setResetForm((current) => ({
          ...current,
          email,
          token,
        }));
        setAuthNotice("");
        setSignUpStatus("");
        setVerificationStatus("");
        setForgotStatus("");
        setResetStatus("");
        setError("");
        setAuthMode("reset");
      } catch {
        // Ignore malformed incoming URLs.
      }
    };

    Linking.getInitialURL().then(applyResetUrl).catch(() => {});
    const subscription = Linking.addEventListener("url", ({ url }) => applyResetUrl(url));

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      setNotes([]);
      setNotesError("");
      setNotesLoading(false);
      return () => {
        active = false;
      };
    }

    (async () => {
      setNotesLoading(true);
      setNotesError("");

      try {
        const data = await notesApi.listNotes({
          sort: "updatedAt:desc",
          limit: 8,
          offset: 0,
        });

        if (active) {
          setNotes(Array.isArray(data?.notes) ? data.notes : []);
        }
      } catch (err) {
        if (active) {
          setNotes([]);
          setNotesError(err?.message || "Unable to load notes.");
        }
      } finally {
        if (active) setNotesLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [notesApi, user]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Enter your username/email and password.");
      return;
    }

    setSubmitting(true);
    setError("");
    setAuthNotice("");

    try {
      const nextUser = await authApi.login(identifier.trim(), password);
      setUser(nextUser);
      setPassword("");
    } catch (err) {
      if (err?.code === "EMAIL_NOT_VERIFIED") {
        const nextEmail = (err?.email || identifier).trim().toLowerCase();
        setVerificationEmail(nextEmail);
        setVerificationStatus(
          "Please verify your email before signing in. We can resend the verification email from here."
        );
        setPassword("");
        setAuthMode("checkEmail");
        setError("");
        return;
      }

      setError(err?.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (signUpSubmittingRef.current) return;

    const firstName = signUpForm.firstName.trim();
    const lastName = signUpForm.lastName.trim();
    const email = signUpForm.email.trim().toLowerCase();
    const username = signUpForm.username.trim();
    const nextPassword = signUpForm.password;
    const confirmPassword = signUpForm.confirmPassword;

    setError("");
    setSignUpStatus("");

    if (!firstName || !lastName || !email || !username || !nextPassword || !confirmPassword) {
      setError("Complete every sign up field.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (username.length < 4) {
      setError("Username must be at least 4 characters.");
      return;
    }

    if (nextPassword.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    if (nextPassword.length > MAX_PASSWORD_LEN) {
      setError(`Password must be ${MAX_PASSWORD_LEN} characters or fewer.`);
      return;
    }

    if (nextPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    signUpSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const signupResult = await authApi.signup({
        firstName,
        lastName,
        email,
        username,
        password: nextPassword,
      });

      const verificationNotice =
        signupResult?.verification?.sent === false
          ? "Account created, but the verification email could not be sent yet. Please try resending it below."
          : "Account created. Check your email for verification before signing in.";
      setSignUpStatus(verificationNotice);
      setVerificationEmail(email);
      setVerificationStatus(verificationNotice);
      setAuthNotice("");
      setForgotStatus("");
      setResetStatus("");
      setAuthMode("checkEmail");
      setIdentifier(email);
      setSignUpForm({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err?.message || "Unable to create account.");
    } finally {
      signUpSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = forgotEmail.trim().toLowerCase();
    setError("");
    setAuthNotice("");
    setSignUpStatus("");
    setVerificationStatus("");
    setForgotStatus("");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await authApi.forgotPassword(email);
      setForgotStatus("If an account exists for that email, a reset link has been sent.");
      setIdentifier(email);
    } catch (err) {
      setError(err?.message || "Unable to send reset email.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const email = resetForm.email.trim().toLowerCase();
    const token = resetForm.token.trim();
    const newPassword = resetForm.newPassword;
    const confirmPassword = resetForm.confirmPassword;

    setError("");
    setAuthNotice("");
    setSignUpStatus("");
    setVerificationStatus("");
    setResetStatus("");

    if (!email || !token) {
      setError("Reset link details are missing.");
      return;
    }

    if (newPassword.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    if (newPassword.length > MAX_PASSWORD_LEN) {
      setError(`Password must be ${MAX_PASSWORD_LEN} characters or fewer.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await authApi.resetPassword({
        email,
        token,
        newPassword,
      });

      const resetNotice = "Password updated. You can sign in now.";
      setResetStatus(resetNotice);
      setAuthNotice(resetNotice);
      setForgotStatus("");
      setAuthMode("signIn");
      setIdentifier(email);
      setResetForm({
        email,
        token,
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err?.message || "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setSubmitting(true);
    setError("");

    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError(err?.message || "Unable to sign out.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshNotes = async () => {
    if (!user) return;

    setNotesLoading(true);
    setNotesError("");

    try {
      const data = await notesApi.listNotes({
        sort: "updatedAt:desc",
        limit: 8,
        offset: 0,
      });

      setNotes(Array.isArray(data?.notes) ? data.notes : []);
    } catch (err) {
      setNotes([]);
      setNotesError(err?.message || "Unable to load notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = verificationEmail.trim().toLowerCase();

    setError("");
    setVerificationStatus("");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await authApi.resendVerification(email);
      setVerificationStatus(
        data?.code === "ALREADY_SENT"
          ? data?.message || "Verification email was already sent recently. Please check your inbox."
          : "Verification email sent. Please check your inbox."
      );
      setIdentifier(email);
    } catch (err) {
      setError(err?.message || "Unable to resend verification email.");
    } finally {
      setSubmitting(false);
    }
  };

  const exampleApiUrl = buildApiUrl("/auth/me", env);
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f6efe4",
      card: "#fffaf3",
      text: "#2d2018",
      border: "rgba(127, 90, 54, 0.12)",
      primary: "#2d2018",
    },
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment px-6">
        <ActivityIndicator color="#8f6840" />
        <Text className="mt-4 text-center text-[15px] leading-6 text-walnut">
          Loading Verse by Verse mobile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="dark" />
      <NavigationContainer theme={navTheme}>
        {user ? (
          <AppTabs
            user={user}
            notes={notes}
            loading={notesLoading}
            error={notesError}
            bibleApi={bibleApi}
            communityApi={communityApi}
            notesApi={notesApi}
            defaultVersionId={DEFAULT_BIBLE_VERSION_ID}
            onRefresh={handleRefreshNotes}
            onLogout={handleLogout}
            submitting={submitting}
          />
        ) : (
          <SignInScreen
            mode={authMode}
            onChangeMode={(mode) => {
              setAuthMode(mode);
              setError("");
              if (mode !== "signIn") {
                setAuthNotice("");
              }
              if (mode !== "checkEmail") {
                setSignUpStatus("");
                setVerificationStatus("");
              }
              if (mode !== "reset") {
                setResetStatus("");
              }
            }}
            initializing={initializing}
            submitting={submitting}
            authNotice={authMode === "signIn" ? authNotice : ""}
            identifier={identifier}
            password={password}
            error={error}
            onChangeIdentifier={setIdentifier}
            onChangePassword={setPassword}
            onSubmit={handleLogin}
            signUpForm={signUpForm}
            onChangeSignUpField={(key, value) =>
              setSignUpForm((current) => ({ ...current, [key]: value }))
            }
            onSubmitSignUp={handleSignUp}
            signUpStatus={signUpStatus}
            checkEmail={{
              email: verificationEmail,
              status: verificationStatus,
              onResend: handleResendVerification,
              onBackToSignIn: () => {
                setAuthMode("signIn");
                setError("");
                setVerificationStatus("");
              },
            }}
            forgotEmail={forgotEmail}
            onChangeForgotEmail={setForgotEmail}
            onSubmitForgotPassword={handleForgotPassword}
            forgotStatus={forgotStatus}
            resetForm={resetForm}
            onChangeResetField={(key, value) =>
              setResetForm((current) => ({ ...current, [key]: value }))
            }
            onSubmitResetPassword={handleResetPassword}
            resetStatus={resetStatus}
            apiBase={apiBase}
            exampleApiUrl={exampleApiUrl}
            envKeys={API_ENV_KEYS}
            scriptureEnvKeys={SCRIPTURE_API_ENV_KEYS}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
